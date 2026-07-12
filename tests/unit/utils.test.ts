import { screenToWorld, getBrainSvgHTML, getSorrelRingSvgHTML } from '../../src/utils';
import { ViewState } from '../../src/types';
import { describe, it, expect } from '@jest/globals';

describe('Utils', () => {
    describe('screenToWorld', () => {
        it('should correctly convert coordinates at 1x scale and zero offset', () => {
            const view: ViewState = { x: 0, y: 0, scale: 1 };
            const canvasRect = { left: 10, top: 20 };
            const result = screenToWorld(100, 200, view, canvasRect);
            expect(result).toEqual({ x: 90, y: 180 });
        });

        it('should correctly handle zoom', () => {
            const view: ViewState = { x: 0, y: 0, scale: 2 };
            const canvasRect = { left: 0, top: 0 };
            const result = screenToWorld(100, 200, view, canvasRect);
            expect(result).toEqual({ x: 50, y: 100 });
        });

        it('should correctly handle panning', () => {
            const view: ViewState = { x: 50, y: 50, scale: 1 };
            const canvasRect = { left: 0, top: 0 };
            const result = screenToWorld(100, 200, view, canvasRect);
            expect(result).toEqual({ x: 50, y: 150 });
        });
    });

    describe('getBrainSvgHTML', () => {
        it('should return an SVG string', () => {
            const html = getBrainSvgHTML();
            expect(html).toContain('<svg');
            expect(html).toContain('Brain Connectome');
        });
    });

    describe('getSorrelRingSvgHTML', () => {
        it('should return an SVG string with SORREL phases', () => {
            const html = getSorrelRingSvgHTML();
            expect(html).toContain('<svg');
            expect(html).toContain('SORREL');
            expect(html).toContain('Specify');
            expect(html).toContain('Observe');
        });
    });
});
