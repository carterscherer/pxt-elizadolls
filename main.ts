namespace elizadolls {

    //% block
    export function hello() {
        basic.showString("Hello ELIZA!")
    }

    //% block
    export function readA0() {
        basic.showNumber(pins.analogReadPin(AnalogPin.P0))
    }

    //% block
    export function pingColor(): number {
        pins.i2cWriteNumber(
            41,
            18,
            NumberFormat.Int8LE,
            true
        )
        return pins.i2cReadNumber(41, NumberFormat.Int8LE, false)
    }
}
