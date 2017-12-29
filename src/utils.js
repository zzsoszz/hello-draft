import { Map, List } from 'immutable';

import { EditorState, ContentBlock, genKey } from 'draft-js';

/*
Get currentBlock in the editorState.
*/
 const getCurrentBlock = (editorState) => {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selectionState.getStartKey());
    return block;
};

/*
Adds a new block (currently replaces an empty block) at the current cursor position
of the given `newType`.
*/
 const addNewBlock = (editorState) => {
     const contentState = editorState.getCurrentContent();
     console.log("contentStateBefore",JSON.stringify(contentState.toJSON()));
     const contentStateWithEntity = contentState.createEntity(
         "image",
         'IMMUTABLE',
         {src: 'https://raw.githubusercontent.com/facebook/draft-js/master/examples/draft-0-10-0/media/media.png' }
     );
     const newEditorState = EditorState.set(
         editorState,
         {currentContent: contentStateWithEntity}
     );
     const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
     console.log("entityKey",entityKey);
     const currentBlock = getCurrentBlock(editorState);
     const blockMap = contentState.getBlockMap();
     const newBlock = new ContentBlock({
        key:entityKey,
        type: "atomic",
        data:""
     });
     const newContentState = contentState.merge({
         blockMap: blockMap.set(entityKey, newBlock)
     });
     console.log("contentStateAfter",JSON.stringify(newContentState.toJSON()));
     return EditorState.push(newEditorState, newContentState, 'change-block-type');
}

export {
    getCurrentBlock,
    addNewBlock
}

// const selectionState = editorState.getSelection();
// if (!selectionState.isCollapsed()) {
//    return editorState;
// }
// const contentState = editorState.getCurrentContent();
// const key = selectionState.getStartKey();
// const blockMap = contentState.getBlockMap();
// const currentBlock = getCurrentBlock(editorState);
// const newBlock = currentBlock.merge({
//     type: newType,
//     data: initialData
// });
// const newContentState = contentState.merge({
//     blockMap: blockMap.set(key, newBlock),
//     selectionAfter: selectionState,
// });