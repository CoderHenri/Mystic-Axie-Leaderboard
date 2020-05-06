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
    }
    ListenSorter();
}

async function GetMysticOwners(url) {
    
    const resp = await fetch(url);
    const data = await resp.json()
    for(m=0; m < 12; m++) {
        try {
            var MysticID = data.axies[m].id;
            var MysticOwner = data.axies[m].owner;
            var MysticClass = data.axies[m].class;
            MysticArrayOwners.push({OwnerETH : MysticOwner, ID : MysticID, amount : 1});
            console.log(MysticID + " IDDDDDDD");
            if(MysticClass == "bird" || MysticClass == "reptile" || MysticClass == "bug") {
                RareClassMysticArrayOwners.push({RareClassOwner : MysticOwner, RareClassID : MysticID, amount : 1})
            }
        } catch { continue; }
    }
}

function ListenSorter() {

    var amount = [];
    MysticArrayOwners.sort((a,b) => b.OwnerETH - a.OwnerETH);

    for(p=0; MysticArrayOwners.length > p; p++) {
        if(p > 0) {
        if(MysticArrayOwners[p].OwnerETH == MysticArrayOwners[p-1].OwnerETH) {
            amount[amount.length - 1].amount = amount[amount.length - 1].amount + MysticArrayOwners[p].amount;
        } else {
            amount.push({amount : MysticArrayOwners[p].amount, OwnerETH : MysticArrayOwners[p].OwnerETH});
        }
        } else {
        amount.push({amount : MysticArrayOwners[p].amount, OwnerETH : MysticArrayOwners[p].OwnerETH});
        }
    }

    amount.sort((a,b) => b.amount - a.amount || a.OwnerETH - b.OwnerETH);

    var MysticAmount = [];

    RareClassMysticArrayOwners.sort((a,b) => b.RareClassOwner - a.RareClassOwner);

    for(p=0; RareClassMysticArrayOwners.length > p; p++) {
        if(p > 0) {
        if(RareClassMysticArrayOwners[p].RareClassOwner == RareClassMysticArrayOwners[p-1].RareClassOwner) {
            MysticAmount[MysticAmount.length - 1].amount = MysticAmount[MysticAmount.length - 1].amount + RareClassMysticArrayOwners[p].amount;
        } else {
            MysticAmount.push({amount : RareClassMysticArrayOwners[p].amount, OwnerETH : RareClassMysticArrayOwners[p].RareClassOwner});
        }
        } else {
            MysticAmount.push({amount : RareClassMysticArrayOwners[p].amount, OwnerETH : RareClassMysticArrayOwners[p].RareClassOwner});
        }
    }

    MysticAmount.sort((a,b) => b.amount - a.amount || a.OwnerETH - b.OwnerETH);

    console.log(amount);
    console.log("bevor Profilenamer");
    ProfileNamer(amount, MysticAmount);
}

async function ProfileNamer(Array, MysticArray) {
  
    var url = "https://axieinfinity.com/graphql-server/graphql"
    
    for(z=0; Array.length > z; z++) {
      var ethAddy = Array[z].OwnerETH;
      ethAddy = JSON.stringify(ethAddy);
      var FetchChecker = "NEIN";
      FetchChecker = "NEIN";
    
      for(n=0; NameArray.length > n; n++) {
        if(NameArray[n].Eth == Array[z].OwnerETH) {
          Array[z].OwnerETH = NameArray[n].Besitzer;
          FetchChecker = "JA";
          break;
        }
      }
    
      
      if(FetchChecker == "NEIN") {
          console.log("sucht");
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          
          body: JSON.stringify({
            operationName:"GetProfileByEthAddress",
            variables:{
              ethereumAddress:ethAddy
            },
            query:"query GetProfileByEthAddress($ethereumAddress: String!) {\n  publicProfileWithEthereumAddress(ethereumAddress: $ethereumAddress) {\n    ...Profile\n    __typename\n  }\n}\n\nfragment Profile on PublicProfile {\n  accountId\n  name\n  addresses {\n    ...Addresses\n    __typename\n  }\n  __typename\n}\n\nfragment Addresses on NetAddresses {\n  ethereum\n  tomo\n  loom\n  __typename\n}\n"})
        })
          
        .then(function(response) { 
          return response.json(); 
        })
     
        .then(function(data) {
          var realName = "";
          try {
            realName = data.data.publicProfileWithEthereumAddress.name;
          }
          catch {
            realName = "No User Profile";
          }
          Array[z].OwnerETH = realName;
        });
      }
    }
    
    ETHAddressNamer(Array, MysticArray);
}

function ETHAddressNamer(MysticArray, RareMysticArray) {
    console.log(MysticArray);
    console.log(RareMysticArray);
    
}