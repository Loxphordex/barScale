/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import * as d3 from "d3";
import { VisualSettings } from "./settings";
import { xml } from "d3";

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

interface DataPoint {
    category: string;
    value: number;
    order?: number;
}

interface ViewModel {
    dataPoints: DataPoint[];
    maxValue: number;
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private viewModel: ViewModel;
    private textNode: Text;
    private host: IVisualHost;
    private locale: string;
    private svg: Selection<SVGElement>;
    private xAxis: Selection<SVGElement>;
    private yAxis: Selection<SVGElement>;
    private scaleGroup: Selection<SVGElement>;
    private barGroup: Selection<SVGElement>;
    private gradient: Selection<SVGElement>;
    private display: Selection<SVGElement>;
    private xPadding: number = 0;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.locale = this.host.locale;
        this.svg = d3.select(options.element)
            .append('svg')
            .classed('bar-chart', true);
        this.xAxis = this.svg.append('g')
            .classed('xAxis', true);
        this.yAxis = this.svg.append('g')
            .classed('yAxis', true);
        this.barGroup = this.svg.append('g')
            .classed('bar-group', true);
        this.scaleGroup = this.svg.append('g')
            .classed('scale-group', true);
        this.gradient = this.svg.append('defs')
            .classed('gradient', true);
        this.display = this.svg.append('g')
            .classed('display', true);
    }

    public update(options: VisualUpdateOptions) {

        // * VIEW SETUP
        this.viewModel = this.getViewModel(options);

        let width: number = options.viewport.width;
        let height: number = options.viewport.height;

        this.svg.attr('width', width);
        this.svg.attr('height', height);

        // * Axis
        let xScale = d3.scaleLinear()
            .domain([-100, 100])
            .range([80, width - 80]);
        let posXScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, (width / 2) - 80]);
        let xAxis = this.xAxis;
        xAxis.attr('transform', `translate(0, ${height - (height / 12)})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');

        // * Y Axis
        let yScale = d3.scaleBand()
            .range([20, height - 20])
            .domain(this.viewModel.dataPoints.map(d => d.category))
            .padding(0.65);

        let yAxis = this.yAxis;
        yAxis.call(d3.axisLeft(yScale))
            .attr('transform', 'translate(80, 0)');

        let innerYScale = d3.scaleBand()
            .range([0, height])
            .domain(this.viewModel.dataPoints.map(d => d.category))
            .padding(0.95);

        // * Gradient
        let grad = this.gradient
            .append('linearGradient');
        grad
            .attr('id', 'gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%')
            .attr('spreadMethod', 'pad');
        grad.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#c00')
            .attr('stop-opacity', 1);
        grad.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#f0ee03')
            .attr('stop-opacity', 0.65);
        grad.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#0c0')
            .attr('stop-opacity', 1);

        // * Rect
        let bars = this.barGroup
            .selectAll('.bar')
            .data(this.viewModel.dataPoints);
        bars.enter()
            .classed('bar', true)
            .attr('x', xScale(-100))
            .attr('y', (d) => yScale(d.category))
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('width', width - 160)
            .attr('height', yScale.bandwidth())
            .attr('fill', 'url(#gradient)');
        bars
            .attr('x', xScale(-100))
            .attr('y', (d) => yScale(d.category))
            .attr('width', width - 160)
            .attr('height', yScale.bandwidth());

        // * Scale
        let scale = this.scaleGroup
            .selectAll('.scale-bar')
            .data(this.viewModel.dataPoints);
        scale.enter()
            .append('rect')
            .classed('scale-bar', true)
            .attr('x', (d) => (d.value >= 0) ? xScale(0) : xScale(d.value))
            .attr('y', (d) => yScale(d.category) + (height / 30))
            .attr('rx', 1)
            .attr('ry', 1)
            .attr('width', (d) => (d.value >= 0) ? posXScale(d.value) : posXScale(d.value * -1))
            .attr('height', innerYScale.bandwidth())
            .attr('fill', 'black');
        scale
            .attr('x', (d) => (d.value >= 0) ? xScale(0) : xScale(d.value))
            .attr('y', (d) => yScale(d.category) + (height / 30))
            .attr('width', (d) => (d.value >= 0) ? posXScale(d.value) : posXScale(d.value * -1))
            .attr('height', innerYScale.bandwidth());

        let display = this.display
            .selectAll('.display-num')
            .data(this.viewModel.dataPoints);
        display.enter()
            .append('text')
            .classed('display-num', true)
            .text((d) => `${d.value}`)
            .attr('x', (d) => width - 50)
            .attr('y', (d) => yScale(d.category) + (height / 30))
            .style('font-weight', 'bold');
        display
            .attr('x', (d) => width - 50)
            .attr('y', (d) => yScale(d.category) + (height / 30));
    }

    private getViewModel(options: VisualUpdateOptions): ViewModel {
        let dv = options.dataViews;
        let viewModel: ViewModel = {
            dataPoints: [],
            maxValue: 0
        };
        if (!dv
            || !dv[0]
            || !dv[0].categorical
            || !dv[0].categorical.categories
            || !dv[0].categorical.categories[0].source
            || !dv[0].categorical.values) {
            return viewModel;
        }
        let view = dv[0].categorical;
        let categories = view.categories[0];
        let values = view.values[0];

        for (let i = 0, len = Math.max(categories.values.length, values.values.length); i < len; i++) {
            viewModel.dataPoints.push({
                category: <string>categories.values[i],
                value: <number>values.values[i]
            });
        }

        viewModel.maxValue = d3.max(viewModel.dataPoints, d => d.value);

        return viewModel;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(VisualSettings.getDefault(), options);
    }
}