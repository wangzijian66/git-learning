function savePlace(){


    // 获取输入内容
    let name = document.getElementById("name").value;

    let lat = document.getElementById("lat").value;

    let lng = document.getElementById("lng").value;

    let info = document.getElementById("info").value;



    // 检查必填项
    if(!name){

        alert("请输入城市名称");

        return;

    }


    if(!lat || !lng){

        alert("请输入经纬度");

        return;

    }



    // 创建旅行地点对象
    let place = {

        name: name,

        lat: Number(lat),

        lng: Number(lng),

        info: info

    };



    // 获取已有用户添加的数据
    let places = 
    JSON.parse(
        localStorage.getItem("places")
    )
    ||
    [];



    // 添加新地点
    places.push(place);



    // 保存回浏览器
    localStorage.setItem(
        "places",
        JSON.stringify(places)
    );



    alert("添加成功！");


    // 返回地图首页
    window.location.href = "index.html";


}