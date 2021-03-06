import React, { Component } from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import Router, { withRouter } from 'next/router'
import Console from '../src/components/Console'
import Countdown from '../src/components/Countdown'
import EditorLayout from '../src/Layout/EditorLayout'
import compareResult from '../src/libs/compareResult'
import ResultModal from '../src/components/ResultModal'
import getAssignmentAPI from '../src/libs/getAssignment'
import submitAssignment from '../src/libs/submitAssignment'
import submitUser from '../src/libs/submitUser'
import CONSTANT from '../src/constants'

const { EDITOR_DEFAULT_PROPS } = CONSTANT

const AceEditor = dynamic(() => import('react-ace'),
{
  ssr: false
})
const PREFIX = '$bugbar >'

class Competition extends Component {
  state = {
    time: 30,
    currentScore: 0,
    content: 'ผลลัพธ์ถูก',
    assignmentID: '',
    name: '',
    code: '',
    answer: '',
    result: '',
    visible: false,
    logs: [],
  }

  componentDidMount() {
    require('brace')
    require('brace/mode/javascript')
    require('brace/theme/monokai')
    this.getAssignment()
    const { Hook, Decode } = require('console-feed')
    Hook(window.console, log => {
      this.setState(({ logs }) => ({ logs: [...logs, Decode(log)] }))
    })
  }

  getAssignment = async () => {
    const { name, score } = this.props.router.query
    if(!name && !score) {
      Router.push('/')
      return
    }
    const result = await getAssignmentAPI(name)
    this.setState({
      assignmentID: result._id,
      name: result.name,
      code: result.question,
      answer: result.answer,
    })
  }

  onEditorChange = (code) => {
    this.setState({
      code,
    })
  }

  onCompile = async () => {
    this.setState({
      logs: [],
    })
    try {
      const { name } = this.props.router.query
      const { time, answer,assignmentID } = this.state
      const result = eval(`
      ${this.state.code.toString()}
      answer()
      `)
      console.log(PREFIX, result)
      if(compareResult(answer,result)){
        await submitAssignment(
          name,
          assignmentID,
          )
        this.setState({
          currentScore: time,
          content:'ถูกต้องนะคร้าบบ',
          visible:true,
          result,
        })
      } else {
        this.setState({
          result,
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  onGetValue = (value) => {
    this.setState({
      time:value
    })
  }

  onTimeout = () => {
    this.setState({ 
      content:'หมดเวลาแล้วววว',
      currentScore: 0,
      visible:true,
    })
  }

  onSubmit = async (visible) => {
    const { name, score } = this.props.router.query
    const { currentScore } = this.state
    await submitUser(name, parseInt(score, 10)+parseInt(currentScore, 10))
    this.setState({ 
        visible:visible
     })
  }

  render() {
    const {
      content,
      visible,
    } = this.state
    return (
      <div>
      <EditorLayout
        onCompile={this.onCompile}
      >
        <Row><h2>{this.state.name}</h2></Row>
        <Row gutter={4}>
          <Col span={12}>
            <AceEditor
              {...EDITOR_DEFAULT_PROPS}
              height="850px"
              value={this.state.code}
              onChange={this.onEditorChange}
              name="ace-code-editor"
              style={{
                fontSize: 18,
              }}
            />
          </Col>
          <Col 
            span={12}
            style={{
              height: '850px'
            }}
          >
            <Console 
              logs={this.state.logs}
            />
          </Col>
        </Row>
        <Countdown callback={this.onTimeout} getValue={this.onGetValue}/>
        <ResultModal content={content} visible={visible} callback={this.onSubmit}/>
      </EditorLayout>
      </div>
    )
  }
}

export default withRouter(Competition)