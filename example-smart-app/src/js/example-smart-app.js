var array1 = [];
var array2 = {};
var array3 = [];
var array4 = [];
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
        smart.api.search({type: "Patient", query: {birthdate: 'le1997-01-01', gender: 'female', '_count':100}})
        .then(function(bundle1){
       // console.log('Search patients', bundle)
          bundle1.data.entry.forEach(function(element){
            array1.push(element.resource.id);
          });
              smart.api.search({type: "Observation", query: {code: '39156-5', date: 'ge2018-12-20', '_count':100}})
              .then(function(bundle2){
             // console.log('Body Mass Index', bundle)
              //  array2 = bundle2.data.entry;
              //  console.log('Array2', array1)
                  bundle2.data.entry.forEach(function(element){
                    array2[element.resource.subject.reference.replace("Patient/", "")] = element.resource.valueQuantity.value;
                  });
                  
                smart.api.search({type: "Condition", query: {code: '72892002', 'recorded-date': 'le2012-08-18', '_count':100}})
                .then(function(bundle3){
                  //console.log('Normal pregnancy', bundle)
                  //array3 = bundle3.data.entry;
                  //console.log('Array3', array3)
                  bundle3.data.entry.forEach(function(element){
                  array3.push(element.resource.subject.reference.replace("Patient/", ""));
                  });
                  
                      array1.filter(value => -1 !== array3.indexOf(value)).forEach(function(element){
                        if(array2.hasOwnProperty(element)){
                          array4.push(element);
                        }
                      });
                  ret.resolve(array4);
                });
              });
        });     
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
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
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
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);
