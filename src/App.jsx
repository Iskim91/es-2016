import React, {Component} from 'react';
import './App.css';
import hljs from 'highlight.js';
import {rando, getRandomPoem} from './utils';
import {
  Container,
  Column,
  Row,
  RuleInput,
  RuleLabel,
  StyleInput,
  Button,
  Document,
  Markup,
  Editor } from './styled';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editor: '',
      name0: '',
      begin0: '',
      end0: '',
      style0: '',
      rules: 1
    };
  }
  handleChange = (event) => {
    let {name, value} = event.target;
    this.setState({
      [name]: value
    })

  }

  get rules() {
    let {rules} = this.state;
    let array = [];
    let fields = ['name', 'begin', 'end', 'style'];
    for(let i = 0; i < rules; i++) {
      array.push(
        <Row key={i}>
          <Column>
            {fields.map((field, index) => {
              return (
                <Column key={index}>
                  <RuleLabel>
                    {field}
                  </RuleLabel>
                  <RuleInput
                    value={this.state[`${field + i}`]}
                    onChange={this.handleChange}
                    name={`${field + i}`}
                  >
                  </RuleInput>
                </Column>
              )
            })}
          </Column>
          <StyleInput
            value={this.state[`style${i}`]}
            name={`style${i}`}
            onChange={this.handleChange}
          />
        </Row>
      )
    }
    return array;
  }

  newFields = () => {
    this.setState((prevState) => {
      let {rules} = prevState;
      let fields = ['name', 'begin', 'end', 'style'];
      let inputValues = {};
      fields.forEach(field => {
        inputValues[field + rules] =  '';
      })
        console.log(rules, inputValues);
      rules++;
      return {
        rules, inputValues
      }
    })
  }

  convertToMarkup = (text = '') => {
    return {
      __html: hljs.highlightAuto(text).value
    }
  }

  language = (newRules) => {
    return () => ({
      contains: [
      ...newRules
      ]
    })
  }

  registerLanguage = (state) => {
    let {rules} = this.state;
    let ruleObjects = [];
    for(let i = 0; i< rules; i++) {
      let newRule = {
        className: state[`name${i}`],
        begin: state[`begin${i}`],
        end: state[`end${i}`]
      }
      let {className, begin, end} = newRule;
      if (
        className.length > 1 &&
        begin.length > 1 &&
        end.length > 1
      ) {
        begin = new RegExp(begin);
        end = new RegExp(end);
        ruleObjects.push(newRule);
      }
    }
    hljs.registerLanguage('language', this.language(ruleObjects));
    hljs.configure({
      languages: ['language']
    })
  }

  componentWillUpdate(nextProps, nextState) {
    this.registerLanguage(nextState)
  }

  prepareStyles = () => {
    let {rules} = this.state;
    let styles = [];
    for(let i = 0; i < rules; i++) {
      styles.push(`
        .hljs-${this.state['name' + i]} {
        ${this.state['style' + i]}
       }
      `)
    }
    let newStyles = "".concat(styles).replace(',', '');

    while (newStyles.includes('random')) {
      newStyles = newStyles.replace('random', rando.color())
    }
    return newStyles;
  }

  getRandomText = async() => {
    try{
      let poem = await getRandomPoem()
      this.handleChange({
        target: {
          name: 'editor',
          value: poem
        }
      })
    } catch(error) {
      console.log(error);
    }
  }

  render() {
    return (
      <Container>
        <Column>
          {this.rules}
          <Button
            onClick={this.newFields}
          >
            New Rule
          </Button>
        </Column>
        <Column>
          <Button
            onClick={this.getRandomText}
          >
            Random Text
          </Button>
          <Document>
            <Editor
              name='editor'
              value={this.state.editor}
              onChange={this.handleChange}
            />
            <Markup
              customStyles={this.prepareStyles()}
              dangerouslySetInnerHTML={this.convertToMarkup(this.state.editor)}
            />
          </Document>
        </Column>
      </Container>
    );
  }
}


