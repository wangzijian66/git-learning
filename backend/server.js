
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;

// 允许前端开发服务器访问后端 API
app.use(cors());

app.use(express.json());

// 解析 JSON 请求体
app.use(express.json());

// 1. 测试接口
app.get("/api/hello", (req, res) => {
    res.json({
        success: true,
        message: "旅行地图后端运行成功！",
        version: "v4.0",
        status: "ok"
    });
});

// 2. 查询 MySQL 中的全部地点
app.get("/api/places", async (req, res) => {
    try {
        const [rows] = await pool.query(
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

// 3. 新增地点到 MySQL
app.post("/api/places", async (req, res) => {
    const { name, lat, lng, info } = req.body || {};

    // 检查城市名称
    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "城市名称不能为空"
        });
    }

    // 检查经纬度
    if (
        lat === undefined ||
        lat === null ||
        String(lat).trim() === "" ||
        lng === undefined ||
        lng === null ||
        String(lng).trim() === "" ||
        !Number.isFinite(Number(lat)) ||
        !Number.isFinite(Number(lng)) ||
        Number(lat) < -90 ||
        Number(lat) > 90 ||
        Number(lng) < -180 ||
        Number(lng) > 180
    ) {
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

        // 查询刚刚新增的记录
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

// 4. 处理不存在的 API
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API 不存在"
    });
});

// 5. 处理无效 JSON 等请求错误
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

// 6. 启动服务器
app.listen(PORT, "0.0.0.0", () => {
    console.log(`后端服务已启动：http://localhost:${PORT}`);
});