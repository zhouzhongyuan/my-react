function ReactCompositeComponent(element) {
    this._currentElement = element;
    this._rootNodeID = null;
    this._instance = null;
}
ReactCompositeComponent.prototype.mountComponent = function (rootID) {
    this._rootNodeID = rootID;
    // 拿到当前元素对应的属性值。
    var publicProps = this._currentElement.props;
    //拿到对应的ReactClass
    var ReactClass = this._currentElement.type;

    // initialize the public class
    var inst = new ReactClass(publicProps);
    this._instance = inst;
    //保留对当前Component的医用，下面更新会用到
    inst._reactInternalInstance = this;

    if(inst.componentDidMount){
        inst.componentWillMount();
    }
    // 调用ReactClass的实例的render方法，返回一个element或者文本节点
    var renderedElement = this._instance.render();
    // 根据element生成
    var renderedComponentInstance = instantiateReactComponent(renderedElement);
    this._renderedComponent = renderedComponentInstance; //存起来，备用。

    //拿到轩然之后的字符串，将当前_rootNodeID传给render的节点。
    var renderedMarkup = renderedComponentInstance.mountComponent(this._rootNodeID);


    $(document).on('mountReady', function () {
        inst.componentDidMount && inst.componentDidMount();
    });
    return renderedMarkup;


}

ReactCompositeComponent.prototype.receiveComponent  = function (nextElement, newState) {
    this._currentElement = nextElement || this._currentElement;

    var inst = this._instance;
    //合并state
    var  nextState = $.extend(inst.state, newState);
    var nextProps =  this._currentElement.props;

    // 改写state
    inst.state = nextState;

    //如果inst有shouldUpdateComponent并且返回false. 说明组件本身不需要跟新，直接返回。
    if(inst.shouldUpdateComponent && (inst.shouldUpdateComponent(nextState, nextProps) === false) ){
        return;
    }

    //如果inst有componentWillUpdate,调用。
    if(inst.componentWillUpdate){
        inst.componentWillUpdate(nextState, nextProps);
    }

    // mountComponent方法中存放的_renderedComponent。
    var prevComponentInstance = this._renderedComponent;
    var prevRenderedElement = prevComponentInstance._currentElement;
    // 重新执行render，拿到新的element。
    var nextRenderedElement = this._instance.render();

    // 判断是 更新 或者 重新渲染
    // 注意： _shouldUpdateReactComponent是全局方法，并非createClass里面的方法。
    if( _shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement) ){
        // 更新
        //如果需要更新，就继续调用子节点的receiveComponent的方法，传入新的element更新子节点。
        // 评论上句注释：我感觉说的不对，根本不是子节点啊。
        prevComponentInstance.receiveComponent(nextRenderedElement);
        //调用componentDidUpdate表示更新完成了
        inst.componentDidUpdate && inst.componentDidUpdate();
    } else {
        // 重新渲染

        //重新new一个Component
        this._renderedComponent = this._instantiateReactComponent(nextRenderedElement);

        //重新生成对应的Element内容
        var nextMarkup  = this._renderedComponent.mountComponent(this._rootNodeID);

        //替换整个节点
        $(`[data-reactid="${this._rootNodeID}"]`).replaceWith(nextMarkup);
    }
}