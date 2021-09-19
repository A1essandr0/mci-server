const fs = require('fs');
import jimp from 'jimp';


export const prepareTargetDir = function(targetDir: string) {
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, {recursive: true}, (err: Error) => { if (err) throw err})
    }
    fs.mkdirSync(targetDir, {}, (err: Error) => { if (err) throw err});
}


export const minifyImage = async function(picSize: number, sourceFile: string, targetFile: string) {
    return await jimp.read(sourceFile).then(
        image => {
            image.background(0xFFFFFFFF).contain(picSize, picSize).write(targetFile);
        }
    ).catch(err => console.log(err));
}


export const generateImage = async function(word: string, picSize: number, bgColor: string, font: string, outfile: string) {
    return await new jimp(picSize, picSize, bgColor, (err, image) => {
        jimp.loadFont(font).then(font => {
            let [textWidth, textHeight] = [jimp.measureText(font, word), jimp.measureTextHeight(font, word, picSize)];
            let [xpos, ypos] = [
                (picSize - textWidth) / 2,
                (picSize - textHeight) / 2
            ];
            image.print(font, xpos, ypos, word).write(outfile)
        })
    })
}


export function sleep(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
