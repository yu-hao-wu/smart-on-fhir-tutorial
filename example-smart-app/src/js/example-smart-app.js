var array1 = [];
var array2 = {};
var array3 = [];
var array4 = {};
(function(window){
  
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('user')) {
       // var people = smart.api.search({type: "Patient", query: {given: ["John", "Bob"], family: "Smith"});
       // console.log('people are:', people);                             
        var patient = smart.user;
        var pt = patient.read();
        smart.api.search({type: "Patient", query: {birthdate: 'le1997-01-01', gender: 'female', '_count':300}})
        .then(function(bundle1){
       // console.log('Search patients', bundle)
          bundle1.data.entry.forEach(function(element){
            var id = element.resource.id;
            array1.push(id);
            var p = defaultPatient();
            p.birthdate = element.resource.birthDate;
            p.fname = element.resource.name[0].family;
            p.lname = element.resource.name[0].given[0];
            p.gender = element.resource.gender;
            array4[id] = p;
          });
              smart.api.search({type: "Observation", query: {code: '39156-5', date: 'ge2016-12-20', '_count':300}})
              .then(function(bundle2){
             // console.log('Body Mass Index', bundle)
              //  array2 = bundle2.data.entry;
              //  console.log('Array2', array1)
                   var tmpDict = {};
                   var tmpArray = [];
                  bundle2.data.entry.forEach(function(element){
                   // array2[element.resource.subject.reference.replace("Patient/", "")] = element.resource.valueQuantity.value;

                   var id = element.resource.subject.reference.replace("Patient/", "");
                   if(array1.includes(id)){
                    array4[id].bmi = element.resource.valueQuantity.value;
                    array4[id].effectiveDate = element.resource.effectiveDateTime;
                    tmpDict[id] = array4[id];
                    tmpArray.push(id);
                   }
                  });
                
                   array4 = tmpDict;
                   array1 = tmpArray;  
                
                smart.api.search({type: "Condition", query: {code: '72892002', 'recorded-date': 'ge2012-08-18', '_count':300}})
                .then(function(bundle3){
                  //console.log('Normal pregnancy', bundle)
                  //array3 = bundle3.data.entry;
                  //console.log('Array3', array3)
                   var tmpDict = {};
                   var tmpArray = [];
                  bundle3.data.entry.forEach(function(element){
               //   array3.push(element.resource.subject.reference.replace("Patient/", ""));
                    var id = element.resource.subject.reference.replace("Patient/", "");
                   if(array1.includes(id)){
                    array4[id].normalPregnancy = "normalPregnancy";
                    array4[id].recordedDate = element.resource.recordedDate;
                    tmpDict[id] = array4[id];
                   }
                  });
                  
                   array4 = tmpDict;
                  /*
                      array1.filter(value => -1 !== array3.indexOf(value)).forEach(function(element){
                        if(array2.hasOwnProperty(element)){
                          array4.push(element);
                        }
                      });
                  */
                  ret.resolve(array4);
                });
              });
        });     
      }
    }
    
    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      bmi: {value: ''},
      effectiveDate: {value: ''},
      normalPregnancy: {value: ''},
      recordedDate: {value: ''}
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }
  
  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    /*
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
    */
    var table = document.getElementById("patientListTable");
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        var row = table.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        var cell7 = row.insertCell(6);
        var cell8 = row.insertCell(7);
        var cell9 = row.insertCell(8);
        cell1.innerHTML = key;
        cell2.innerHTML = p[key].fname;
        cell3.innerHTML = p[key].lname;
        cell4.innerHTML = p[key].gender;
        cell5.innerHTML = p[key].birthdate;
        cell6.innerHTML = p[key].bmi;
        cell7.innerHTML = p[key].effectiveDate;
        cell8.innerHTML = p[key].normalPregnancy;
        cell9.innerHTML = p[key].recordedDate;
      }
    }
  };

})(window);
