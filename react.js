function ReactDOMTextComponent(text) {
    this._currentElement = ' ' + text;
    this._rootNodeID = null;
}

ReactDOMTextComponent.prototype.mountComponent = function (rootID) {
    this._rootNodeID = rootID;
    return '<span data-reactid="' + rootID + '">' + this._currentElement + '</span>';
}

function ReactElement(type, key, props) {
    this.type = type;
    this.key = key;
    this.props = props;
}

function ReactDOMComponent(element) {
    this._currentElement = element;
    this._rootNodeID = null;
}
ReactDOMComponent.prototype.mountComponent = function (rootID) {
    this._rootNodeID  = rootID;
    var props = this._currentElement.props;
    var tagOpen = '<' + this._currentElement.type;
    var tagClose = '</' + this._currentElement.type + '>';

    tagOpen += ' data-reactid=' + this._rootNodeID;

    //props
    for(let property in props){
        // event
        if(/^on[A-Za-z]/.test(property)){
            var eventType = property.replace('on', '');
            $(document).delegate('[data-reactid="' + this._rootNodeID + '"]', eventType + '.' + this._rootNodeID, props[property]);

        }
        // normal props
        if(props[property] && property !== 'children' && !/^on[A-Za-z]/.test(property) ){
            tagOpen += ' ' + property + '=' + props[property];
        }
    }

    //children
    var content = '';
    var children = props.children || [];
    
    var childrenInstances = [];
    var that = this;
    
    $.each(children, function (key, child) {
        var childComponentInstance = instantiateReactComponent(child);
        childComponentInstance._mountIndex = key;

        childrenInstances.push(childComponentInstance);

        var curRootId  = that._rootNodeID + '.' + key;

        var childMarkup = childComponentInstance.mountComponent(curRootId);

        content += ' ' + childMarkup;
    })

    this._renderedChildren = childrenInstances;

    return tagOpen + '>' + content + tagClose;
    
    
    
    
    
    // All
}




function instantiateReactComponent(node) {
    if(typeof node === 'string' || typeof node === 'number'){
        return new ReactDOMTextComponent(node);
    }
    if(typeof node === 'object' && typeof node.type === 'string'){
        return new ReactDOMComponent(node);
    }
}


React = {
    nextReactRootIndex: 0,
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