const RENDER_TO_DOM = Symbol('render to DOM');

export class Component{
    constructor(){
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }
    setAttribute(name, value){
        this.props[name] = value;
    }
    appendChild(component){
       this.children.push(component)
    }
    get vDom(){
        // 递归调用
        return this.render().vDom;
    }
    [RENDER_TO_DOM](range){
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }
    reRender(){
        this._range.deleteContents();
        this[RENDER_TO_DOM](this._range);
    }
    setState(newState){
        // 直接覆盖
        if(this.state === null || typeof this.state !== "object"){
            this.state = newState;
            this.reRender();
        }
        let merge = (oldState, newState) => {
            for(let p in newState) {
                // 不存在或者是叶子——终止条件
                if(oldState[p] === null || typeof oldState[p] !== "object"){
                    oldState[p] = newState[p];
                } else {
                    // 递归
                    merge(oldState[p], newState[p]);
                }
            }
        }
        merge(this.state, newState);
        this.reRender();
    }
}
class ElementWrapper extends Component{
    constructor(type){
        super(type);
        this.type = type;
        this.root = document.createElement(type);
    }
    get vDom(){
        return {
            type: this.type,
            props: this.props,
            children: this.children.map(child=>child.vDom),
        }
    }
    /*
    setAttribute(name, value){
        if(name.match(/^on([\s\S]+)$/)){
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c=>c.toLowerCase()), value);
        }else{
            this.root.setAttribute(name, value);
        }
    }
    appendChild(component){
        let range = document.createRange();
        range.setStart(this.root,  this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        component[RENDER_TO_DOM](range);
    }
    */
    [RENDER_TO_DOM](range){
        range.deleteContents();
        range.insertNode(this.root);
    }
}

class TextWrapper extends Component{
    constructor(content){
        super(content);
        this.content = content;
        this.root = document.createTextNode(content);
    }
    get vDom(){
        return {
            type: '#text',
            content: this.content,
        }
    }
    [RENDER_TO_DOM](range){
        range.deleteContents();
        range.insertNode(this.root);
    }
} 


export function createElement(type, attributes, ...children) {
    let e;
    if(typeof type === 'string'){
        e =  new ElementWrapper(type);
    }else{
        e = new type();
    }
    for(let p in attributes){
        e.setAttribute(p, attributes[p]);
    }
    let insertChildren = (children)=>{
        for(let child of children){
            if(typeof child === 'string'){
                child = new TextWrapper(child);
            }
            if(typeof child === 'object' && child instanceof Array){
                // 递归
                insertChildren(child);
            }else{
                e.appendChild(child);
            }
        }
    }
    insertChildren(children)
    return e;
}

export function render(component, parentElement) {
    let range = document.createRange();
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}