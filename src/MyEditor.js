import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState,convertToRaw,RichUtils,Modifier,CompositeDecorator,AtomicBlockUtils} from 'draft-js';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
import {
    ItalicButton,
    BoldButton,
    UnderlineButton,
    CodeButton,
    HeadlineOneButton,
    HeadlineTwoButton,
    HeadlineThreeButton,
    UnorderedListButton,
    OrderedListButton,
    BlockquoteButton,
    CodeBlockButton,
} from 'draft-js-buttons';


const styles = {
    root: {
        fontFamily: '\'Georgia\', serif',
        padding: 20,
        width: 600,
    },
    buttons: {
        marginBottom: 10,
    },
    urlInputContainer: {
        marginBottom: 10,
    },
    urlInput: {
        fontFamily: '\'Georgia\', serif',
        marginRight: 10,
        padding: 3,
    },
    editor: {
        border: '1px solid #ccc',
        cursor: 'text',
        minHeight: 80,
        padding: 10,
    },
    button: {
        marginTop: 10,
        textAlign: 'center',
    },
    link: {
        color: '#3b5998',
        textDecoration: 'underline',
    },
};

const Link = (props) => {
    console.log(props);
    const {url} = props.contentState.getEntity(props.entityKey).getData();
    return (
        <a href={url} style={styles.link}>
            {props.children}
        </a>
    );
};

function findLinkEntities(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'linkIdentifier'
            );
        },
        callback
    );
}

function mediaBlockRenderer(block) {
    if (block.getType() === 'atomic') {
        return {
            component: Media,
            editable: false,
        };
    }

    return null;
}

const Audio = (props) => {
    return <audio controls src={props.src} style={styles.media} />;
};

const Image = (props) => {
    return <img src={props.src} style={styles.media} />;
};

const Video = (props) => {
    return <video controls src={props.src} style={styles.media} />;
};

const Media = (props) => {
    const entity = props.contentState.getEntity(
        props.block.getEntityAt(0)
    );
    const {src} = entity.getData();
    const type = entity.getType();

    let media;
    if (type === 'audio') {
        media = <Audio src={src} />;
    } else if (type === 'image') {
        media = <Image src={src} />;
    } else if (type === 'video') {
        media = <Video src={src} />;
    }

    return media;
};

class MyEditor extends React.Component {
  state={
      plainText:"",
      jsonStr:""
  }
   styleMap = {
      'HELLO': {
          textDecoration: 'line-through',
      }
  };
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
          {
              strategy: findLinkEntities,
              component: Link,
          },
    ]);

    this.state = {editorState: EditorState.createEmpty(decorator)};
    this.onChange = (editorState) => {
        const contentState = this.state.editorState.getCurrentContent();
        const rawJson = convertToRaw(contentState);
        const jsonStr = JSON.stringify(rawJson, null, 1);
        const plainText = contentState.getPlainText();
        this.setState({editorState,plainText,jsonStr});
        this.getEntityAtCursor(editorState);
    };


  }
  getEntityAtCursor(editorState) {
        const selectionState = editorState.getSelection();
        const selectionKey = selectionState.getStartKey();
        const contentstate = editorState.getCurrentContent();

        // get the block where the cursor is
        const block = contentstate.getBlockForKey(selectionKey);

        // get the Entity key at the where the cursor is
        const entityKey = block.getEntityAt(selectionState.getStartOffset());
        if (entityKey) {
            // use the following method to get the entity instance
            const entityInstance = contentstate.getEntity(entityKey);
            const data = entityInstance.getData();
            this.setState({ retrievedData: data.url });
        } else {
            this.setState({ retrievedData: "" });
        }
  }
  onChangeColor=(e)=>{
      console.log("onChangeColor");
      this.onChange(RichUtils.toggleInlineStyle(this.state.editorState,"HELLO"));
      console.log(this.state.editorState);
  }
  createLink=(e)=>{
      console.log("createLink start");
      const editorState = this.state.editorState;
      const contentstate = editorState.getCurrentContent();
      contentstate.createEntity('linkIdentifier', "IMMUTABLE", { url: "http://www.baidu.com" });
      const entityKey = contentstate.getLastCreatedEntityKey();
      const selectionState = this.state.editorState.getSelection();
      const newContentState = Modifier.applyEntity(contentstate, selectionState, entityKey);
      const newEditorState = EditorState.push(this.state.editorState, newContentState, 'apply-entity');
      this.onChange(newEditorState);
      console.log("createLink end");
  }
  createMedia= (e) => {
        e.preventDefault();
        const {editorState} = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            "image",
            'IMMUTABLE',
            {src: 'https://raw.githubusercontent.com/facebook/draft-js/master/examples/draft-0-10-0/media/media.png' }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
            editorState,
            {currentContent: contentStateWithEntity}
        );
        var editorStateNew= AtomicBlockUtils.insertAtomicBlock(
              newEditorState,
              entityKey,
              ' '
          );
        this.onChange(editorStateNew);
    }
    // _onBoldClick() {
  //     this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  // }
  render() {
    return (
        <div>
          <button onClick={this.onChangeColor}>红色</button>
          <button onClick={this.createLink}>创建链接</button>
          <button onClick={this.createMedia}>创建图片</button>
          <Editor editorState={this.state.editorState}
                  onChange={this.onChange}
                  customStyleMap={this.styleMap}
                  blockRendererFn={mediaBlockRenderer}
                  // handleKeyCommand={this.handleKeyCommand}
          />
          <div>recive:{this.state.retrievedData}</div>
          <pre>
              {this.state.jsonStr}
          </pre>

        </div>
    );
  }
}

export  default MyEditor
export {
    MyEditor
}