var NameArray = [];

async function ReadTextFile() {
    NameArray = await AsyncTextReader();
    console.log(NameArray);
    GetMysticAxies();
}

function AsyncTextReader() {
    return new Promise(function (resolve, reject) {
        var objXMLhttp = new XMLHttpRequest()
        objXMLhttp.open("GET", './Textfiles/Profile_Loom_Eth_Addresses.txt', true);
        objXMLhttp.send();
        objXMLhttp.onreadystatechange = function(){
        if (objXMLhttp.readyState == 4){
          if(objXMLhttp.status == 200) {
            var TestParse = objXMLhttp.responseText;
            TestParse = JSON.parse(TestParse);
            return resolve(TestParse);
          } else {
            return resolve("error");
          }
        }
      }
    });
}

var MysticsOwners = [];

function GetMysticAxies() {
      
      var AllMysticsURL = "https://axieinfinity.com/api/v2/axies?mystic=true&offset=12&sorting=lowest_id";
      getAxiePrice(AllMysticsURL);
      
    async function getAxiePrice(url) {
      const resp = await fetch(url);
      const data = await resp.json()
      var AllMystics = data.totalAxies;
      console.log(AllMystics);
    }
}
