// import logo from './logo.svg';
import './css/App.css';
import './css/portfolio.css';
import './css/bg.css';
import Portfolio from './components/Portfolio';
import Canvas from './components/Canvas';
import bgShapes1 from './static/Back Shapes_bg.svg';
import bgShapes2 from './static/Back Shapes_bg_2.svg';
import mvl from './static/madewithlove.svg';
import logo from './static/logo.svg';
import { useState, useEffect, useRef } from 'react';

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

function App() {
    const rgbToHslHsvHex = (rgb) => {
        var rgbArr = [rgb.r, rgb.g, rgb.b];
        var M, m, C, hue, V, L, Sv, Sl;
        M = Math.max(...rgbArr);
        m = Math.min(...rgbArr);
        C = M - m;
        // I = (rgbArr[0] + rgbArr[1] + rgbArr[2]) / 3;
        // Hue
        if (C === 0) hue = 0;
        else if (M === rgbArr[0]) hue = ((rgbArr[1] - rgbArr[2]) / C) % 6;
        else if (M === rgbArr[1]) hue = (rgbArr[2] - rgbArr[0]) / C + 2;
        else if (M === rgbArr[2]) hue = (rgbArr[0] - rgbArr[1]) / C + 4;
        hue *= 60;
        // Lightness and Value
        V = M / 255;
        L = (M + m) / (2 * 255);
        // Saturation
        if (V === 0) Sv = 0;
        else Sv = C / (V * 255);
        if (L === 1 || L === 0) Sl = 0;
        else Sl = C / (255 * (1 - Math.abs(2 * L - 1)));

        hue = ((hue % 360) + 360) % 360;
        let hsv = { h: hue, s: Sv, v: V, a: 1 };
        let hsl = { h: hue, s: Sl, l: L, a: 1 };
        rgb.a = 1;
        let hex = '#';
        for (let i in rgbArr) {
            let colorcode = Math.floor(rgbArr[i]).toString(16);
            hex += '0'.repeat(2 - colorcode.length) + colorcode;
        }
        return { rgb: rgb, hsv: hsv, hsl: hsl, hex: hex };
    };
    /**
     * Function that converts hex encoded colour to rgb format.
     *
     * @param {string} hex
     * @returns {rgb} {r,g,b}
     */
    const hexToRgb = (hex) => {
        var aRgbHex = hex.match(/.{1,2}/g);
        // console.log(aRgbHex)
        var aRgb = {
            r: parseInt(aRgbHex[0], 16),
            g: parseInt(aRgbHex[1], 16),
            b: parseInt(aRgbHex[2], 16),
        };
        return aRgb;
    };
    /**
     * Function to convert multi-representation colour object to 2x3 array of RGB and HSV representations.
     *
     * @param {{rgb:object, hsv:object, [hsl:object, hex:object]}} obj
     * @return {[Array, Array]} [[h, s, v], [r, g, b]].
     */
    const hsvRgbObjToArr = (obj) => {
        var arr = [
            [0, 0, 0],
            [0, 0, 0],
        ];
        arr[0] = [obj.hsv.h, obj.hsv.s, obj.hsv.v];
        arr[1] = [obj.rgb.r, obj.rgb.g, obj.rgb.b];
        return arr;
    };

    const getColourPoints = (rawCP) => {
        let cP = new Array(rawCP.radii.length);
        for (let i in rawCP.colours) {
            // console.log(rawCP.colours[i]);
            // console.log(hexToRgb(rawCP.colours[i]));
            cP[i] = {
                x: rawCP.positions[i][0] / rawCP.viewport[0],
                y: rawCP.positions[i][1] / rawCP.viewport[1],
                colour: rgbToHslHsvHex(hexToRgb(rawCP.colours[i])),
                colourArr: hsvRgbObjToArr(
                    rgbToHslHsvHex(hexToRgb(rawCP.colours[i]))
                ),
                radius: rawCP.radii[i],
            };
        }
        // console.log(cP);
        return cP;
    };
    var rawCP = {
        colours: [
            'DEECE5',
            'C7DEE5',
            'E3EEFD',
            'ffffff',
            'ffffff',
            'E7F5EE',
            'DEECE5',
        ],
        // colours: [
        //     '000000',
        //     'FF0000',
        //     '00FF00',
        //     '0000FF',
        //     'FFFF00',
        //     '00FFFF',
        //     'FF00FF',
        // ],
        radii: [1.3, 1.9, 1.53, 1.01, 1.81, 0.6, 1.11],
        positions: [
            [120.8854, 78.9364],
            [382.0792, 303.7385],
            [108.4034, 492.5733],
            [483.9389, 561.1634],
            [816.4031, 521.2621],
            [832.2423, 592.2427],
            [810.4892, 299.7712],
        ],
        viewport: [841.89, 595.28],
    };
    const [colourPoints, setColourPoints] = useState(getColourPoints(rawCP));
    const [oCP, setOCP] = useState(JSON.parse(JSON.stringify(colourPoints)));
    const [startPerturbation, setStartPerturbation] = useState(false);
    const printColour = (p) => {
        console.log([p.x, p.y]);
    };
    const perturbPos = (first = false) => {
        let cP = JSON.parse(JSON.stringify(colourPoints));
        // console.log(
        //     Math.max(Math.min(oCP[0].x + (Math.random() * 2 - 1) * 1, 1))
        // );
        if (first) {
            for (let i in oCP) {
                oCP[i].x = Math.max(
                    Math.min(oCP[i].x + ((Math.random() * 2 - 1) / 2) * 0.5, 1),
                    0
                );
                oCP[i].y = Math.max(
                    Math.min(oCP[i].y + ((Math.random() * 2 - 1) / 2) * 0.5, 1),
                    0
                );
                setOCP([...oCP]);
                // // console.log([cP[i].x, cP[i].y]);
                // cP[i].x = cP[i].x + (Math.random() * 2 - 1) * 0.1;
                // cP[i].y = cP[i].y + (Math.random() * 2 - 1) * 0.1;
                // console.log([cP[i].x, cP[i].y]);
            }
        } else if (startPerturbation) {
            for (let i in oCP) {
                // console.log([cP[i].x, cP[i].y]);
                // if (
                //     oCP[i].x - cP[i].x < 0.0001 ||
                //     oCP[i].y - cP[i].y < 0.0001
                // ) {
                oCP[i].x =
                    (((oCP[i].x + ((Math.random() * 2 - 1) / 2) * 0.05) % 1) +
                        1) %
                    1;
                oCP[i].y =
                    (((oCP[i].y + ((Math.random() * 2 - 1) / 2) * 0.05) % 1) +
                        1) %
                    1;
                setOCP([...oCP]);
                // }
                cP[i].x = Math.max(
                    Math.min(
                        cP[i].x + 0.005 * Math.random() * (oCP[i].x - cP[i].x),
                        1
                    ),
                    0
                );
                cP[i].y = Math.max(
                    Math.min(
                        cP[i].y + 0.005 * Math.random() * (oCP[i].y - cP[i].y),
                        1
                    ),
                    0
                );
                // console.log(0.05 * Math.random() * (oCP[i].y - cP[i].y));
                // console.log([cP[i].x, cP[i].y]);
            }
        }
        setColourPoints(cP);
    };

    useInterval(perturbPos, 1);

    useEffect(() => {
        perturbPos(true);
        setStartPerturbation(true);
    }, []);

    return (
        <div className="App">
            <Canvas id={'gradientPalette'} canvasPoints={colourPoints} />
            <div className="bg_c_c">
                <div id="bg_Container_1" className="bg_Container">
                    <object
                        data={bgShapes1}
                        id="bgShapes_1"
                        type="image/svg+xml"
                        alt="bg image"
                    />
                </div>
            </div>
            <div className="bg_c_c">
                <div id="bg_Container_2" className="bg_Container">
                    <object
                        data={bgShapes2}
                        id="bgShapes_2"
                        type="image/svg+xml"
                        alt="another bg image"
                    />
                </div>
            </div>
            <object
                data={logo}
                id="logo"
                type="image/svg+xml"
                alt="spiral logo"
            />
            <p id="myname">Kishore S. Shenoy</p>
            <div id="pfs_container">
                <div id="portfolios">
                    <Portfolio
                        title="Design Portfolio"
                        link="https://kichappa.github.io/resume/design.htm"
                        desc="This is my general design portfolio. These are works done primarily for coursework or hobby."
                    />
                    <Portfolio
                        title="Engineering Portfolio"
                        link="https://kichappa.github.io/resume/eng.htm"
                        desc="This is my engineering. These are works done primarily for senior thesis and coursework."
                    />
                    <Portfolio
                        title="UX Portfolio"
                        link="https://kichappa.github.io/resume/ux.htm"
                        desc="Here are the works I did in User Experience Design. These include wireframes and prototypes made for my intern at HeyPrescribe!, coursework and hobby."
                    />
                </div>
            </div>
            <object
                data={mvl}
                id="mvl"
                type="image/svg+xml"
                alt="made with love"
            />
        </div>
    );
}

export default App;
