function extractTextFromElement(element: ChildNode) : string {
    let text = '';
    if (element.nodeType === Node.TEXT_NODE) {
        text += element.textContent;
    }
    else if (element.childNodes && element.childNodes.length > 0) {
        for (const childNode of element.childNodes) {
            text += extractTextFromElement(childNode);
        }
    }

    return text;
}

export function extractContentFromDOM() {
    const body = document.querySelector('body');
    if (body) {
        return extractTextFromElement(body);
    }
    return '';
}