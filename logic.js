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

var MysticArrayOwners = [];
var RareClassMysticArrayOwners = [];

async function GetMysticAxies() {
      
    var OffsetNumber = 0;
    var AllMysticsURL = "https://axieinfinity.com/api/v2/axies?mystic=true&offset="+OffsetNumber+"&sorting=lowest_id";
    var OffsetAmount = 0;
    await getAmountMystics(AllMysticsURL);
    
    async function getAmountMystics(url) {
        const resp = await fetch(url);
        const data = await resp.json()
        OffsetAmount = data.totalAxies;
        OffsetAmount = Math.floor(OffsetAmount/12);
    }



    for(i=0; i < OffsetAmount; i++) {
        console.log("i= " + i);
        OffsetNumber = OffsetNumber + 12
        AllMysticsURL = "https://axieinfinity.com/api/v2/axies?mystic=true&offset="+OffsetNumber+"&sorting=lowest_id";
        console.log(OffsetNumber);
        await GetMysticOwners(AllMysticsURL);
        if(i == (OffsetAmount - 1)) {
            console.log(MysticArrayOwners);
            console.log(RareClassMysticArrayOwners);
        }
    }
}

async function GetMysticOwners(url) {
    
    const resp = await fetch(url);
    const data = await resp.json()
    for(m=0; m < 12; m++) {
        try {
            var MysticID = data.axies[m].id;
            var MysticOwner = data.axies[m].owner;
            var MysticClass = data.axies[m].class;
            MysticArrayOwners.push({Owner : MysticOwner, ID : MysticID});
            console.log(MysticID + " IDDDDDDD");
            if(MysticClass == "bird" || MysticClass == "reptile" || MysticClass == "bug") {
                RareClassMysticArrayOwners.push({RareClassOwner : MysticOwner, RareClassID : MysticID})
            }
        } catch { continue; }
    }
}