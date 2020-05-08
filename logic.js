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

async function GetMysticAxies() {

  var MysticArray = [];

  var url = "https://axieinfinity.com/graphql-server/graphql"

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    
    body: JSON.stringify({
      operationName:"GetAxieBriefList",
      variables:{
        "from":0,
        "size":2400,
        "sort":"IdAsc",
        "auctionType":"All",
        "owner":null,
        "region":null,
        "criteria":{
          "parts":null,
          "bodyShapes":null,
          "classes":null,
          "stages":null,
          "numMystic":[1,2,3,4],
          "pureness":null,
          "title":null,
          "breedable":null,
          "breedCount":null,
          "hp":[],"skill":[],"speed":[],"morale":[]
        }
      },
      query:"query GetAxieBriefList($auctionType: AxieAuctionType, $region: String, $criteria: AxieCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, region: $region, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n  id\n  class\n  owner\n __typename\n}\n"})
  })
    
  .then(function(response) { 
    return response.json(); 
  })

  .then(function(data) {
    MysticArray = data;
    console.log(MysticArray);
    console.log(MysticArray.data.axies.results.length);
    ArrayConverter(MysticArray);
  });
}

function ArrayConverter(Array) {

  Array.data.axies.results.sort((a,b) => b.owner - a.owner);

  var NonNestedMysticArray = [];
  var UniqueOwnerArray = [];

  var RareMystic = 0;

  for(i = 0; i < Array.data.axies.results.length; i++) {
    if(Array.data.axies.results[i].class == "Reptile" || Array.data.axies.results[i].class == "Bug" || Array.data.axies.results[i].class == "Bird") {
      RareMystic = 1;
    } else {
      RareMystic = 0;
    }
    NonNestedMysticArray.push({EthOwner : Array.data.axies.results[i].owner, Mystics : 1, RareMystics : RareMystic});
  }

  for(i = 0; i < NonNestedMysticArray.length; i++) {
    if(i > 0) {
      if(NonNestedMysticArray[i].EthOwner == UniqueOwnerArray[UniqueOwnerArray.length-1].EthOwner) {
        UniqueOwnerArray[UniqueOwnerArray.length-1].Mystics = UniqueOwnerArray[UniqueOwnerArray.length-1].Mystics + NonNestedMysticArray[i].Mystics;
        UniqueOwnerArray[UniqueOwnerArray.length-1].RareMystics = UniqueOwnerArray[UniqueOwnerArray.length-1].RareMystics + NonNestedMysticArray[i].RareMystics;
      } else {
        UniqueOwnerArray.push({EthOwner : NonNestedMysticArray[i].EthOwner, Mystics : NonNestedMysticArray[i].Mystics, RareMystics : NonNestedMysticArray[i].RareMystics});
      }
    } else {
      UniqueOwnerArray.push({EthOwner : NonNestedMysticArray[i].EthOwner, Mystics : NonNestedMysticArray[i].Mystics, RareMystics : NonNestedMysticArray[i].RareMystics});
    }
  }
  UniqueOwnerArray.sort((a,b) => b.Mystics - a.Mystics);
  ProfileNamer(UniqueOwnerArray);
}

async function ProfileNamer(Array) {
  
  var url = "https://axieinfinity.com/graphql-server/graphql"
    
    for(z=0; Array.length > z; z++) {
      var ethAddy = Array[z].EthOwner;
      var FetchChecker = "NEIN";
      FetchChecker = "NEIN";
    
      for(n=0; NameArray.length > n; n++) {
        if(NameArray[n].Eth == Array[z].EthOwner) {
          Array[z].EthOwner = NameArray[n].Besitzer;
          FetchChecker = "JA";
          break;
        }
      }
    
      if(FetchChecker == "NEIN") {
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          
          body: JSON.stringify({
            operationName:"GetProfileNameByEthAddress",
            variables:{
              ethereumAddress:ethAddy
            },
            query:"query GetProfileNameByEthAddress($ethereumAddress: String!) {\n  publicProfileWithEthereumAddress(ethereumAddress: $ethereumAddress) {\n    name\n    __typename\n  }\n}\n"})
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
            realName = "No User Name";
          }
          Array[z].EthOwner = realName;
        });
      }
      
    }
  console.log(Array);
  ListMaker(Array);
}

function ListMaker(Array) {

  var MysticList = Array;
  var RareMysticList = [];

  for(i = 0; i < Array.length; i++) {
    if(Array[i].RareMystics != 0) {
      RareMysticList.push({EthOwner : Array[i].EthOwner, Mystics : Array[i].RareMystics});
    }
  }
  RareMysticList.sort((a,b) => b.Mystics - a.Mystics);
  console.log(MysticList);
  console.log(RareMysticList);

  document.getElementById("MList").innerHTML = '<ol class="LL">' + MysticList.map(function (genesis) {
    return '<li>' + String(genesis["Mystics"]) + " Mystics owned by " + String(genesis["EthOwner"]) + '</li>';
  }).join('') + '</ol>';

  document.getElementById("RList").innerHTML = '<ol class="LL">' + RareMysticList.map(function (genesis) {
    return '<li>' + String(genesis["Mystics"]) + " Rare Mystics owned by " + String(genesis["EthOwner"]) + '</li>';
  }).join('') + '</ol>';

  ChartMaker(MysticList, "MChart");
  ChartMaker(RareMysticList, "RChart");
}

function ChartMaker(Array, WhichChart) {

  var RestMenge = 0;
  for(i=9; Array.length > i; i++) {
    RestMenge = RestMenge + Array[i].Mystics;
  }

  var GesamtMenge = 0;
  for(i=0; Array.length > i; i++) {
    GesamtMenge = GesamtMenge + Array[i].Mystics;
  }

  var ctx = document.getElementById(WhichChart);

  var LandMenge = [Array[0].Mystics, Array[1].Mystics, Array[2].Mystics, Array[3].Mystics, Array[4].Mystics, Array[5].Mystics, Array[6].Mystics, Array[7].Mystics, Array[8].Mystics, RestMenge];
  var LandBesitzer = [Array[0].EthOwner, Array[1].EthOwner, Array[2].EthOwner, Array[3].EthOwner, Array[4].EthOwner, Array[5].EthOwner, Array[6].EthOwner, Array[7].EthOwner, Array[8].EthOwner, "All other Players"];

  var myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: LandBesitzer,
      datasets: [{
          label: 'Axie Land',
          data: LandMenge,
          backgroundColor: [
            'rgba(0,104,55, 0.25)',
            'rgba(165,0,38, 0.25)',
            'rgba(26,152,80, 0.25)',
            'rgba(215,48,39, 0.25)',
            'rgba(102,189,99, 0.25)',
            'rgba(244,109,67, 0.25)',
            'rgba(166,217,106, 0.25)',
            'rgba(253,174,97, 0.25)',
            'rgba(217,239,139, 0.25)',
            'rgba(254,224,139, 0.25)'
          ],
          borderColor: [
            'rgba(0,104,55, 1)',
            'rgba(165,0,38, 1)',
            'rgba(26,152,80, 1)',
            'rgba(215,48,39, 1)',
            'rgba(102,189,99, 1)',
            'rgba(244,109,67, 1)',
            'rgba(166,217,106, 1)',
            'rgba(253,174,97, 1)',
            'rgba(217,239,139, 1)',
            'rgba(254,224,139, 1)'
          ],
        borderWidth: 1
      }]
    },
    options: {
      tooltips: {
        displayColors: false,
        callbacks: {
          afterLabel: function(tooltipItem, data) {
            var dataset = data['datasets'][0];
            var percent = Math.round((dataset['data'][tooltipItem['index']] / GesamtMenge) * 100)
            return '(' + percent + '%)';
          }
        },
      },
      responsive: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          fontColor: '#FF8C00',
          boxWidth: 15,
          fontSize: 15
        }
      }
    }
  })
  var L = document.getElementById("lds-hourglass");
  L.style.display = "none";
}