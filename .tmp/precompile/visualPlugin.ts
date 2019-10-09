import { Visual } from "../../src/visual";
var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];

var barScaleFE80866A28C34628876B06375447C054 = {
    name: 'barScaleFE80866A28C34628876B06375447C054',
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