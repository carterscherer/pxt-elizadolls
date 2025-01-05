namespace ElizaDolls {

    // In case it gets lost from above (// then %) 
    //  % color="#FE99F8"

    let pulseMinLocal = 1024;
    let pulseMaxLocal = 0;
    let pulseLocal = 0;
    let pulseMotion = 0.001;

    //% block="read beat"
    //% group="Pulse"
    export function pulseSensorBeat( ) : boolean {

        pulseLocal = pins.analogReadPin( AnalogPin.P1 );

        pulseMinLocal += ( 1024 - pulseMinLocal ) * pulseMotion;
        if (pulseLocal < pulseMinLocal )
            pulseMinLocal = pulseLocal;

        pulseMaxLocal -= pulseMaxLocal * pulseMotion;
        if (pulseLocal > pulseMaxLocal)
            pulseMaxLocal = pulseLocal;

        let range = pulseMaxLocal - pulseMinLocal;

        let output = false;

        if ( range > 0 ) {
            if ( ( pulseLocal - pulseMinLocal ) > 3 * range / 4 )
                output = true;
        }

        return output;
    }

    let pulseSensorBpmBeat = false;
    let pulseSensorBpmRunningTime = 0;
    let pulseSensorBpmStore = 0;

    //% block="read pulse BPM"
    //% group="Pulse"
    export function pulseSensorBpm(): number {
        let beat = pulseSensorBeat();
        if ( beat && ( beat != pulseSensorBpmBeat ) ) {
            let runningTime = input.runningTime();
            pulseSensorBpmStore = 60000 / ( runningTime - pulseSensorBpmRunningTime );
            pulseSensorBpmRunningTime = runningTime;
        }
        pulseSensorBpmBeat = beat;
        return pulseSensorBpmStore;
    }

    //% block="read pulse wave"
    //% group="Pulse"
    export function pulseSensorWave(): number { 
        pulseLocal = pins.analogReadPin(AnalogPin.P1);

        pulseMinLocal += (1024 - pulseMinLocal) * pulseMotion;
        if (pulseLocal < pulseMinLocal)
            pulseMinLocal = pulseLocal;

        pulseMaxLocal -= pulseMaxLocal * pulseMotion;
        if (pulseLocal > pulseMaxLocal)
            pulseMaxLocal = pulseLocal;

        let range2 = pulseMaxLocal - pulseMinLocal;

        let output2 = 0;

        if (range2 > 0) {
            output2 = 1024 * (pulseLocal - pulseMinLocal) / range2;
        }

        return output2;    
    }

/*
    //% block="read pulse max"
    //% group="Pulse"
    export function pulseSensorRangeMax(): number { return pulseMaxLocal; }

    //% block="read pulse min"
    //% group="Pulse"
    export function pulseSensorRangeMin(): number { return pulseMinLocal; }
*/

    // For all LED functions
    // Packing into number:  ( r << 16 ) | (g << 8 ) | b
    // Sending to ws2812   ---b---g---r--->
    // Added some text to pxt.json to disable BT 
    // this helps with console output!

    //% block="set Left Earring, Right Earring, Necklace $leftEar | $rightEar | $necklace"
    //% group="Accessories"
    //% leftEar.shadow="colorNumberPicker"
    //% rightEar.shadow="colorNumberPicker"
    //% necklace.shadow="colorNumberPicker"
    export function ledAccessories(leftEar: number, rightEar: number, necklace: number ) {
        let e = pins.createBuffer(13 * 3)
        let offset = 0;

        // Left Ear

        let rColor = (leftEar >> 16) & 0xFF;
        let gColor = (leftEar >> 8) & 0xFF;
        let bColor = (leftEar >> 0) & 0xFF;

        e[offset + 0] = gColor;
        e[offset + 1] = rColor;
        e[offset + 2] = bColor;

        // Right Ear

        offset += 3;

        rColor = (rightEar >> 16) & 0xFF;
        gColor = (rightEar >> 8) & 0xFF;
        bColor = (rightEar >> 0) & 0xFF;

        e[offset + 0] = gColor;
        e[offset + 1] = rColor;
        e[offset + 2] = bColor;

        // Necklace

        for ( let i = 0; i < 11; i++ ) { 
            offset += 3;

            rColor = (necklace >> 16) & 0xFF;
            gColor = (necklace >> 8) & 0xFF;
            bColor = (necklace >> 0) & 0xFF;

            e[offset + 0] = gColor;
            e[offset + 1] = rColor;
            e[offset + 2] = bColor;
        }
        
        // Zip all the colors out

        ws2812b.sendBuffer(e, DigitalPin.P16);
    }

    //% block="set Accessory $accessory"
    //% group="Accessories"
    //% accessory.shadow="colorNumberPicker"
    export function ledAccessory(accessory: number) {
        let f = pins.createBuffer(12 * 3)
        let offset2 = 0;

        // Accessory
        let rColor2;
        let gColor2;
        let bColor2;

        for (let j = 0; j < 12; j++) {
            rColor2 = (accessory >> 16) & 0xFF;
            gColor2 = (accessory >> 8) & 0xFF;
            bColor2 = (accessory >> 0) & 0xFF;

            f[offset2 + 0] = gColor2;
            f[offset2 + 1] = rColor2;
            f[offset2 + 2] = bColor2;

            offset2 += 3;
        }

        // Zip all the colors out

        ws2812b.sendBuffer(f, DigitalPin.P16);
    }


    //% block="set ring led $cv"
    //% group="Ring"
    //% cv.shadow="colorNumberPicker"
    export function ringDirect(cv: number) {
        let g = pins.createBuffer(25 * 3)

        let rColor22 = (cv >> 16) & 0xFF;
        let gColor22 = (cv >> 8) & 0xFF;
        let bColor22 = (cv >> 0) & 0xFF;

        for (let k = 0; k < 25; k++) {
            g[k * 3 + 0] = gColor22;
            g[k * 3 + 1] = rColor22;
            g[k * 3 + 2] = bColor22;
        }
        // ws2812b.setBufferMode(DigitalPin.P8, ws2812b.BUFFER_MODE_RGB );
        ws2812b.sendBuffer(g, DigitalPin.P8);
    }

    //% block="Animated Rainbow Ring $cv"
    //% group="Ring"
    //% cv.shadow="colorNumberPicker"
    export function ringDirectRainbow() {
        let g = pins.createBuffer(25 * 3); // 25 LEDs, each with 3 bytes (RGB)

        for (let i = 0; i < 255; i++) {
            for (let k = 0; k < 25; k++) {
                // Create a wave effect by varying the colors across the LEDs
                let rColor = (i + k * 10) % 50; // Red shifts slightly per LED
                let gColor = (i + k * 20) % 50; // Green shifts faster
                let bColor = (i + k * 30) % 50; // Blue shifts even faster

                // Assign the colors to the buffer
                g[k * 3 + 0] = gColor; // G
                g[k * 3 + 1] = rColor; // R
                g[k * 3 + 2] = bColor; // B
            }

            // Send the buffer to the LEDs
            ws2812b.sendBuffer(g, DigitalPin.P8);

            // Simple delay to slow down the animation
            basic.pause(100); // Adjust the pause duration to change speed
        }
    }



    //% block
    //% group="Distance Sensor"
    export function distance(): number {
        let trig = DigitalPin.P1;
        let echo = DigitalPin.P2;
        let maxCMDistance = 100 * 58;

        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCMDistance);

        return Math.idiv(d, 58);
    }

    //% block
    //% group="Analog Soil Moisture"
    export function soilMoisture(): number {
        // Read the analog value from the soil moisture sensor on AnalogPin.P1
        const moistureLevel = pins.analogReadPin(AnalogPin.P0);

        // Optionally, you can map the moisture level to a percentage (0-100%)
        const minValue = 0;   // Adjust this based on your sensor's calibration for dry soil
        const maxValue = 1023; // Adjust this based on your sensor's calibration for wet soil
        const percentage = Math.map(moistureLevel, minValue, maxValue, 0, 100);

        // Return the moisture percentage
        return Math.constrain(percentage, 0, 100);
    }

    // //% block
    // //% group="Digital Soil Moisture"
    // export function soilMoistureDigital(): number {
    //     // Read the analog value from the soil moisture sensor on AnalogPin.P1
    //     const moistureLevel = pins.digitalReadPin(DigitalPin.P1);
    //     const moistureLevelTwo = pins.digitalReadPin(DigitalPin.P2);

    //     // Optionally, you can map the moisture level to a percentage (0-100%)
    //     const minValue = 0;   // Adjust this based on your sensor's calibration for dry soil
    //     const maxValue = 1023; // Adjust this based on your sensor's calibration for wet soil
    //     const percentage = Math.map(moistureLevel, minValue, maxValue, 0, 100);

    //     // Return the moisture percentage
    //     return Math.constrain(percentage, 0, 100);
    // }


    // 

    let colorSensorConfigured: boolean = false;
    let colorSensorAddress: number = 0x39;
    let colorSensorEnableRegister: number = 0x80;
    let colorSensorATimeRegister: number = 0x81;
    let colorSensorWTimeRegister: number = 0x83;
    let colorSensorPersRegister: number = 0x8C;
    let colorSensorAGainRegister: number = 0x8F;
    let colorSensorIdRegister: number = 0x92;
    let colorSensorStatusRegister: number = 0x93;
    let colorSensorRedRegister: number = 0x96;
    let colorSensorGreenRegister: number = 0x98;
    let colorSensorBlueRegister: number = 0x9A;

    let colorSensorId: number = 0x90;

    //% block
    //% group="ColorSensor"
    export function checkColorSensor(): boolean {
        let id3 = i2cReadRegister8(colorSensorAddress, colorSensorIdRegister);
        // basic.showNumber( id )
        return (id3 == colorSensorId)
    }

    export function colorSensorReadId(): number {
        let id32 = i2cReadRegister8(colorSensorAddress, colorSensorIdRegister);
        // basic.showNumber( id )
        return id32;
    }

    export function colorSensorReadStatus(): number {
        let status = i2cReadRegister8(colorSensorAddress, colorSensorStatusRegister);
        // basic.showNumber( id )
        return status;
    }

    export function colorSensorReadEnable(): number {
        let status2 = i2cReadRegister8(colorSensorAddress, colorSensorEnableRegister);
        // basic.showNumber( id )
        return status2;
    }

    //% block
    //% group="ColorSensor"
    export function colorSensorRead(): number {
        let rSense: number = 0;
        let bSense: number = 0;
        let gSense: number = 0;

        colorSensorConfigure();

        if (colorSensorConfigured) {
            rSense = i2cReadRegister16(colorSensorAddress, colorSensorRedRegister);
            gSense = i2cReadRegister16(colorSensorAddress, colorSensorGreenRegister);
            bSense = i2cReadRegister16(colorSensorAddress, colorSensorBlueRegister);
        }

        let punchup = 3;  // 2.5 worked for a while - too washed out?

        let rColor222 = (rSense >> 8) & 0xFF;
        let gColor222 = (gSense >> 8) & 0xFF;
        let bColor222 = (bSense >> 8) & 0xFF;

        rColor222 = Math.pow(rColor222, punchup );
        gColor222 = Math.pow(gColor222, punchup );
        bColor222 = Math.pow(bColor222, punchup );

        let cMax = (rColor222 > gColor222) ? rColor222 : gColor222;
        cMax = (bColor222 > cMax) ? bColor222 : cMax;

        rColor222 = 16 * rColor222 / cMax;
        gColor222 = 16 * gColor222 / cMax;
        bColor222 = 16 * bColor222 / cMax;

        // basic.showNumber( rColor >> 4 );

        return (rColor222 << 16) | (gColor222 << 8) | bColor222;
        // return (rSense << 16) | (gSense << 8) | bSense;

    }

    //% block
    //% group="ColorSensor"
    export function colorGetRed(color: number): number {
        return (color >> 16) & 0xFF;
    }

    //% block
    //% group="ColorSensor"
    export function colorGetGreen(color: number): number {
        return (color >> 8) & 0xFF;
    }

    //% block
    //% group="ColorSensor"
    export function colorGetBlue(color: number): number {
        return (color & 0xFF);
    }

    function colorSensorConfigure() {
        if (!colorSensorConfigured && checkColorSensor()) {
            // turn it on
            // Control Reg:  PON
            i2cWriteRegister(colorSensorAddress, colorSensorEnableRegister, 0x01)

            basic.pause(100)

            // ATime  :RGB TIMING:FF 2.4ms, C0 150ms
            i2cWriteRegister(colorSensorAddress, colorSensorATimeRegister, 0xC0)
            // Wait Time:FF 2.4ms
            i2cWriteRegister(colorSensorAddress, colorSensorWTimeRegister, 0xFF)
            // Persistance: 0x00 - IRQ every time
            i2cWriteRegister(colorSensorAddress, colorSensorPersRegister, 0)
            // AGain: 0 - 3
            i2cWriteRegister(colorSensorAddress, colorSensorAGainRegister, 3)

            // Control Reg:  PON AEN
            i2cWriteRegister(colorSensorAddress, colorSensorEnableRegister, 0x08 | 0x03)
            basic.pause(100)


            //            basic.showString( "C");
            colorSensorConfigured = true;
        }
    }

    export function i2cReadRegister8(address: number, register: number): number {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(address, NumberFormat.UInt8LE, false)
    }

    export function i2cReadRegister16(address: number, register: number): number {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(address, NumberFormat.UInt16LE, false)
    }

    export function i2cWriteRegister8_8(address: number, register: number, value: number) {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        pins.i2cWriteNumber(address, value, NumberFormat.UInt8LE, false)
    }

    export function i2cWriteRegister(address: number, register: number, value: number) {
        pins.i2cWriteNumber(
            address,
            register | (value << 8),
            NumberFormat.UInt16LE,
            false
        )
        // pins.i2cWriteNumber(address, value, NumberFormat.UInt8LE, false)
    }

}
