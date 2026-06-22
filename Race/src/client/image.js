function createImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);    /* succsess load - return object */
        img.onerror = (err) => reject(err); /* load error */
        img.src = (url);
    });
}

export async function loadImage(url) {
    try {
        /* wait for completely load image */
        const img = await createImage(url);
        return img;
    } catch (error) {
        console.error("Image didn't load:", error);
        return null;
    }
}