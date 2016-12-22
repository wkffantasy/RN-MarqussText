

import React, { Component, PropTypes } from 'react';
import {
  ScrollView,
  Text,
  View,
  InteractionManager,
} from 'react-native';

export default class MarqueeTextView extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    titleStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
    style: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
    textMargin:PropTypes.number,//当文字过长时，两个Text的间距，默认是10
  };
  constructor(props) {
    super(props);
    this.state = {
      viewWidth:0,
      textWidth:0,
      viewWider:true,
      layoutStatus:false,
    };
    this.scrollX = 0;
  }
  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
    console.log('MarqueeText componentWillUnmount clear timer');
  }
  _viewLayout(e) {
    if (e && e.nativeEvent && e.nativeEvent.layout) {
      const width = e.nativeEvent.layout.width;
      this.setState({
        ...this.state,
        viewWidth:width
      });
      InteractionManager.runAfterInteractions(() => {
        this._relayout();
      });
    }
  }
  _textLayout(e) {
    if (e && e.nativeEvent && e.nativeEvent.layout) {
      const width = e.nativeEvent.layout.width;
      this.setState({
        ...this.state,
        textWidth:width
      });
      InteractionManager.runAfterInteractions(() => {
        this._relayout();
      });
    }
  }
  _startMovingAnimate() {
    const maxScrollX = this.state.textWidth + this._getPadding();
    console.log('MarqueeText start movingAnimation maxScrollX==',maxScrollX);
    if (this.timer) {
      console.log('_startMovingAnimate return');
      return;
    }
    console.log('set timer');
    this.timer = setInterval(
      () => {
        if (this.scrollX >= maxScrollX) {
          this.scrollX = 0;
        } else {
          this.scrollX += 1;
        }
        // console.log('this.scrollX ==',this.scrollX);
        if (this.refs.scrollView) {
          this.refs.scrollView.scrollTo({
            x:this.scrollX,
            y:0,
            animated:this.scrollX != 0,
          });
        } else {
          this.timer && clearInterval(this.timer);
        }
      },
      80,
    );
  }
  _relayout() {
    if (this.state.textWidth == 0 || this.state.viewWidth == 0) {
    } else {
      console.log('_relayout textWidth==',this.state.textWidth);
      console.log('_relayout viewWidth==',this.state.viewWidth);
      this.setState({
        ...this.state,
        viewWider:this.state.textWidth < this.state.viewWidth,
        layoutStatus:true,
      });
      InteractionManager.runAfterInteractions(() => {
        this._startMovingAnimate();
      });

    }
  }
  _renderTextView(padding) {
    return (
      <Text style={[{ fontSize:17,color:'#333333',marginRight:padding },this.props.titleStyle]} numberOfLines={1}>{this.props.title}</Text>
    );
  }
  _getPadding() {
    let padding = 10;
    if (this.props && this.props.textMargin && this.props.textMargin > 0) {
      padding = this.props.textMargin;
    }
    return padding;
  }
  _renderContent() {
    const padding = this._getPadding();
    return (
      <ScrollView
        ref={'scrollView'}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        canCancelContentTouches={false}
        contentContainerStyle={{ flexDirection:'row' }}
      >
        {this._renderTextView(padding)}
        {this._renderTextView(0)}
      </ScrollView>
    );
  }
  _renderTextToGetWidth() {
    if (this.state.layoutStatus) {
      return null;
    }
    return (
      <ScrollView style={{ position:'absolute',opacity:0,left:1000,top:1000 }} horizontal={true}>
        <Text
          style={[{ fontSize:17,color:'#333333' },this.props.titleStyle]}
          onLayout={(e) => { this._textLayout(e); }}
          numberOfLines={1}
        >
          {this.props.title}
        </Text>
      </ScrollView>
    );
  }

  render() {
    return (
      this.state.layoutStatus && this.state.viewWider ?
        <View style={[{ justifyContent:'center',alignItems:'center' },this.props.style]}>
          <Text style={[{ fontSize:17,color:'#333333' },this.props.titleStyle]} numberOfLines={1}>{this.props.title}</Text>
        </View>
      :
        <View
          style={this.props.style}
          onLayout={(e) => { this._viewLayout(e); }}
        >
          {this._renderContent()}
          {this._renderTextToGetWidth()}
        </View>
    );
  }
}
