(function(root){'use strict';
 class ScenarioModel{
 constructor(data,studies){this.data=data;this.studies=studies;this.application=100;this.enabled=new Set(studies.map(s=>s.code));}
 setApplication(value){if(!Number.isFinite(value))throw Error('Ungültiger Anteil');this.application=Math.max(0,Math.min(100,value));return this.result();}
 rate(code){const s=this.studies.find(s=>s.code===code);return s&&this.enabled.has(code)?s.reduction*this.application/100:null;}
 result(){let energy=0,coveredEnergy=0,coveredMass=0;for(const i of this.data.items){const r=this.rate(i.code);if(i.included&&r!==null){energy+=i.loss_kcal*r;coveredEnergy+=i.loss_kcal;coveredMass+=i.loss_1000t/1000;}}const requirement=this.data.minimum_kcal,referenceEnergy=this.data.hungry_people*requirement*365;return{energy,coveredEnergy,coveredMass,unknownEnergy:this.data.energy_kcal-coveredEnergy,people:energy/(requirement*365),ratio:energy/referenceEnergy,referenceEnergy,requirement,threshold:referenceEnergy/this.data.energy_kcal*100,application:this.application,maximumPeople:this.data.energy_kcal/(requirement*365)};}}
 if(typeof module==='object'&&module.exports)module.exports=ScenarioModel;else root.ScenarioModel=ScenarioModel;
})(typeof window!=='undefined'?window:this);
