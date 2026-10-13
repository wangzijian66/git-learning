async function savePlace(){


    let name =
    document.getElementById("name").value;


    let info =
    document.getElementById("info").value;



    if(!name){

        alert("请输入城市名称");

        return;

    }



    // 调用免费地理编码接口
    let url =
    `https://nominatim.openstreetmap.org/search?format=json&q=${name}`;



    try{


        let response =
        await fetch(url);



        let data =
        await response.json();



        if(data.length === 0){

            alert("没有找到该地点");

            return;

        }



        // 获取第一个结果
        let place = {


    id: Date.now(),


    name:name,


    lat:Number(data[0].lat),


    lng:Number(data[0].lon),


    info:info


};



        // 保存用户地点

        let places =
        JSON.parse(
            localStorage.getItem("places")
        )
        ||
        [];



        places.push(place);



        localStorage.setItem(
            "places",
            JSON.stringify(places)
        );



        alert("添加成功");



        window.location.href="index.html";



    }

    catch(error){


        console.error(error);


        alert("定位失败");


    }


}