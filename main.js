import {createElement, Component, render} from './toy-react.js'
class MyComponent extends Component {
    constructor(){
        super();
        this.state = {
            a: 1,
            b: 2,
        }
    }
    render(){
        return <div>
            <h1>MyComponent</h1>
            <h2>{this.state.a.toString()}</h2>
            {this.children}
        </div>
    }
}


render(<MyComponent id='a' class='c'> 
    <div>
        <div>dsfsdfsdfsd</div>
    </div>
    <div></div>
</MyComponent>, document.body);