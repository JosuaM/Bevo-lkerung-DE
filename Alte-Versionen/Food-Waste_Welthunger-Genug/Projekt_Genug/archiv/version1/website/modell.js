/* Reine Rechnung. Für Browser und unabhängige Node-Prüfung. */
(function(root){
 'use strict';
 class ScenarioModel {
  constructor(data){this.data=data;this.rescue=50;this.requirement=data.reference_kcal;}
  set(rescue,requirement){
   if(!Number.isFinite(rescue)||!Number.isFinite(requirement)||requirement<=0)throw new Error('Ungültiges Szenario');
   this.rescue=Math.min(100,Math.max(0,rescue));this.requirement=requirement;return this.result();
  }
  result(){const energy=this.data.energy_kcal*this.rescue/100;const people=energy/(this.requirement*365);
   return {energy,people,ratio:people/this.data.hungry_people,threshold:this.data.hungry_people*this.requirement*365/this.data.energy_kcal*100,rescue:this.rescue,requirement:this.requirement};}
 }
 if(typeof module==='object'&&module.exports)module.exports=ScenarioModel;else root.ScenarioModel=ScenarioModel;
})(typeof window!=='undefined'?window:this);
