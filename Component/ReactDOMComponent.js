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
    // All
    return tagOpen + '>' + content + tagClose;
}
ReactDOMComponent.prototype.receiveComponent = function (nextElement) {
    var lastProps = this._currentElement.props;
    var nextProps = nextElement.props;

    this._currentElement = nextElement;

    // 更新当前节点
    this._updateDOMProperties(lastProps, nextProps);

    // 更新子节点
    this._updateDOMChildren(nextElement.props.children);
}

ReactDOMComponent.prototype._updateDOMProperties = function (lastProps, nextProps) {
    var propKey;


    // 当老的属性不在新的属性集合里时，删除掉。
    for(propKey in lastProps){
        // 对于新props中有的，或者 不是ownProperty，跳过。
        if(nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey)){
            continue;
        }
        // 对于监听时间，去除监听。
        if(/^on[A-Za-z]/.test(propKey)){
            var eventType = propKey.replace('on', '');
            $(document).undelegate(`[data-reactid="${this._rootNodeID}"]`, eventType, lastProps[propKey]);
            continue;
        }
        // 对于普通不需要的属性，删除。
        $(`[data-reactid="${this._rootNodeID}"]`).removeAttr(propKey);
    }

    // 把新属性添加到dom节点上。
    for(propKey in nextProps){
        // 对于监听事件，更新。
        if(/^on[A-Za-z]/.test(propKey)){
            const eventType = propKey.replace('on', '');
            lastProps[propKey] && $(document).undelegate(`[data-reactid="${this._rootNodeID}"]`, eventType, lastProps[propKey]);
            $(document).delegate('[data-reactid="' + this._rootNodeID + '"]', eventType + '.' + this._rootNodeID, props[property]);
            continue;
        }
        // 对于children, 忽略。
        if(propKey === 'children'){
            continue;
        }
        // 对于普通property，更新。
        $(`[data-reactid="${this._rootNodeID}"]`).prop(propKey, nextProps[propKey]);
    }
}

// 全局更新深度标识
var updateDepth = 0;
// 全局更新队列， 所有的差异都存在这里。
var diffQueue = [];

ReactDOMComponent.prototype._updateDOMChildren = function (nextChildrenElement) {
    updateDepth++;
    this._diff(diffQueue, nextChildrenElement);
    updateDepth--;
    if(updateDepth === 0) {
        //在需要的时候，调用patch，执行具体的dom操作。
        this._patch(diffQueue);
        diffQueue=[];
    }
}