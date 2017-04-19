// 差异更新的四种类型
/*
* MOVE_EXISTING	新的component类型在老的集合里也有，并且element是可以更新的类型，在generateComponentChildren我们已经调用了receiveComponent，这种情况下prevChild=nextChild,那我们就需要做出移动的操作，可以复用以前的dom节点。
 INSERT_MARKUP	新的component类型不在老的集合里，那么就是全新的节点，我们需要插入新的节点
 REMOVE_NODE	老的component类型，在新的集合里也有，但是对应的element不同了不能直接复用直接更新，那我们也得删除。老的component不在新的集合里的，我们需要删除
* */
const UPDATE_TYPES = {
    MOVE_EXISTING: 1,
    REMOVE_NODE: 2,
    INSERT_MARKUP: 3,
}

//普通的children是一个数组，此方法把它转换成一个map,key就是element的key,如果是text节点或者element创建时并没有传入key,就直接用在数组里的index标识.。
// flatten: 弄平，打到，扁平化。
function flattenChildren(componentChildren) {
    var child;
    var name;
    var childMap = {};
    for(var i = 0; i < componentChildren.length; i++){
        child = componentChildren[i];
        name = child && child._currentElement && child._currentElement.key ? child._currentElement.key : i.toString(36);
        childMap[name] = child;
    }
    return childMap;
}

// 主要用来生成子节点elements的element集合。
// 如果是更新，继续使用以前的componentInstance，调用相应的receiveComponent。
// 如果是新节点，就会重新生成一个componentInstance。
function generateComponentChildren(prevChildren, nextChildrenElements) {
    var nextChildren = {};
    nextChildrenElements = nextChildrenElements || [];
    $.each(nextChildrenElements, function (index, element) {
        var name = element.key ? element.key : index;
        var prevChild = prevChildren && prevChildren[name];
        var prevElement = prevChild && prevChild._currentElement;
        var nextElement = element;

        // 更新 or 重新渲染
        if(_shouldUpdateReactComponent(prevElement, nextElement)){
            // 递归调用子节点的receiveComponent
            prevChild.receiveComponent(nextElement);
            // 继续使用老的Component
            nextChildren[name] = prevChild;
        } else {
            // 重新渲染
            var nextChildInstance = instantiateReactComponent(nextElement, null);
            // 使用新的Component
            nextChildren[name] = nextChildInstance;
        }

    });
    return nextChildren;
}

// _diff用来递归找出区别，组装差异对象，添加到更新队列diffQueue
ReactDOMComponent.prototype._diff = function (diffQueue, nextChildrenElements) {
    var self = this;
    var prevChildren = flattenChildren(self._renderedChildren);
    // 生成新的children的Component对象集合。会复用老的Component对象。
    var nextChildren = generateComponentChildren(prevChildren, nextChildrenElements);
}