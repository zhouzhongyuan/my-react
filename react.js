function ReactElement(type, key, props) {
    this.type = type;
    this.key = key;
    this.props = props;
}

var ReactClass = function () {
    
}
ReactClass.prototype.render = function () {

}

function instantiateReactComponent(node) {
    if(typeof node === 'string' || typeof node === 'number'){
        return new ReactDOMTextComponent(node);
    }
    if(typeof node === 'object' && typeof node.type === 'string'){
        return new ReactDOMComponent(node);
    }
    if(typeof node === 'object' && typeof node.type === 'function'){
        return new ReactCompositeComponent(node);
    }
}


React = {
    nextReactRootIndex: 0,
    createClass: function (spec) {
        //生成一个子类
        var Constructor = function (props) {
            this.props = props;
            this.state = this.getInitialState ? this.getInitialState() : null;
        }

        // 原型继承，继承超级父类
        Constructor.prototype = new ReactClass();
        Constructor.prototype.constructor = Constructor;

        // Mixin spec
        $.extend(Constructor.prototype, spec);
        return Constructor;
    },
    createElement: function (type, config, children) {
        var props = {};
        var propName;
        config = config || {};
        var key = config.key || null;

        //copy config to porps
        for(propName in config){
            if(config.hasOwnProperty(propName) && propName !== 'key'){
                props[propName] = config[propName];
            }
        }

        // children
        var childrenLength = arguments.length - 2;
        if(childrenLength === 1){
            props.children = $.isArray(children) ? children : [children];
        }else if( childrenLength > 1){
            var childArray = new Array(childrenLength);
            for(var i = 0; i < childrenLength; i++){
                childArray[i] = arguments[i+2];
            }
            props.children = childArray;
        }
        return new ReactElement(type, key, props);
    },
    render: function (element, container) {
        var componentInstance = instantiateReactComponent(element);
        var markup = componentInstance.mountComponent(React.nextReactRootIndex++);
        $(container).html(markup);
        $(document).trigger('mountReady');
    }

}