import { Visual } from "../../src/visual";
var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];

<<<<<<< HEAD
var barScaleFE80866A28C34628876B06375447C054_DEBUG = {
    name: 'barScaleFE80866A28C34628876B06375447C054_DEBUG',
=======
var barScaleFE80866A28C34628876B06375447C054 = {
    name: 'barScaleFE80866A28C34628876B06375447C054',
>>>>>>> 95a8d275d235b0174d29ba20c901d36d06c4435e
    displayName: 'BarScale',
    class: 'Visual',
    version: '1.0.0',
    apiVersion: '2.6.0',
    create: (options) => {
        if (Visual) {
            return new Visual(options);
        }

        console.error('Visual instance not found');
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["barScaleFE80866A28C34628876B06375447C054"] = barScaleFE80866A28C34628876B06375447C054;
}

export default barScaleFE80866A28C34628876B06375447C054;