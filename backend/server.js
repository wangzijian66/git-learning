
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 测试接口
app.get("/api/hello", (req, res) => {
    res.json({
        success: true,
        message: "旅行地图后端运行成功！",
        version: "v4.0",
        status: "ok"
    });
});

// 1. 查询全部地点
app.get("/api/places", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id, name, lat, lng, info, created_at
             FROM places
             ORDER BY id`
        );

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("查询地点失败：", error.message);

        res.status(500).json({
            success: false,
            message: "查询地点失败"
        });
    }
});

// 2. 新增地点
app.post("/api/places", async (req, res) => {
    const { name, lat, lng, info } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "城市名称不能为空"
        });
    }

    if (!isValidCoordinates(lat, lng)) {
        return res.status(400).json({
            success: false,
            message: "请提供有效的经纬度"
        });
    }

    if (info !== undefined && typeof info !== "string") {
        return res.status(400).json({
            success: false,
            message: "地点介绍必须是字符串"
        });
    }

    try {
        const [result] = await pool.execute(
            `INSERT INTO places (name, lat, lng, info)
             VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                Number(lat),
                Number(lng),
                typeof info === "string" ? info.trim() : ""
            ]
        );

        const [rows] = await pool.execute(
            `SELECT id, name, lat, lng, info, created_at
             FROM places
             WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "地点添加成功",
            data: rows[0]
        });
    } catch (error) {
        console.error("新增地点失败：", error.message);

        res.status(500).json({
            success: false,
            message: "新增地点失败"
        });
    }
});

// 3. 编辑地点
app.put("/api/places/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { name, lat, lng, info } = req.body || {};

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "地点 ID 无效"
        });
    }

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "城市名称不能为空"
        });
    }

    if (!isValidCoordinates(lat, lng)) {
        return res.status(400).json({
            success: false,
            message: "请提供有效的经纬度"
        });
    }

    if (info !== undefined && typeof info !== "string") {
        return res.status(400).json({
            success: false,
            message: "地点介绍必须是字符串"
        });
    }

    try {
        const [result] = await pool.execute(
            `UPDATE places
             SET name = ?, lat = ?, lng = ?, info = ?
             WHERE id = ?`,
            [
                name.trim(),
                Number(lat),
                Number(lng),
                typeof info === "string" ? info.trim() : "",
                id
            ]
        );

        // 不存在的 ID 返回 404
        if (result.affectedRows === 0) {
            const [existing] = await pool.execute(
                "SELECT id FROM places WHERE id = ?",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "地点不存在"
                });
            }
        }

        const [rows] = await pool.execute(
            `SELECT id, name, lat, lng, info, created_at
             FROM places
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "地点修改成功",
            data: rows[0]
        });
    } catch (error) {
        console.error("修改地点失败：", error.message);

        res.status(500).json({
            success: false,
            message: "修改地点失败"
        });
    }
});

// 4. 删除地点
app.delete("/api/places/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "地点 ID 无效"
        });
    }

    try {
        const [result] = await pool.execute(
            "DELETE FROM places WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "地点不存在"
            });
        }

        res.json({
            success: true,
            message: "地点删除成功"
        });
    } catch (error) {
        console.error("删除地点失败：", error.message);

        res.status(500).json({
            success: false,
            message: "删除地点失败"
        });
    }
});

// 检查经纬度
function isValidCoordinates(lat, lng) {
    if (
        lat === undefined || lat === null || String(lat).trim() === "" ||
        lng === undefined || lng === null || String(lng).trim() === ""
    ) {
        return false;
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

// 未知 API
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API 不存在"
    });
});

// 错误处理
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            success: false,
            message: "请求中的 JSON 格式不正确"
        });
    }

    console.error("服务器错误：", err.message);

    res.status(500).json({
        success: false,
        message: "服务器内部错误"
    });
});

// 启动服务
app.listen(PORT, "0.0.0.0", () => {
    console.log(`后端服务已启动：http://localhost:${PORT}`);
});