import React, { Component } from 'react'
import { 
  Row, 
  Col, 
  Button, 
  Input,
  notification
} from 'antd'
import AdminLayout from '../../src/Layout/AdminLayout'
import createNewQuestion from '../../src/libs/createNewQuestion'
import Editor from '../../src/components/Editor'

const initialState = {
  loading: false,
  title: '',
  questionCode: '',
  answerCode: '',
}

export default class Quest extends Component {
  state = initialState

  onTitleChange = ({ target }) => {
    this.setState({
      title: target.value
    })
  }

  onQuestionCodeEditorChange = (code) => {
    this.setState({
      questionCode: code
    })
  }

  onAnswerCodeEditorChange = (code) => {
    this.setState({
      answerCode: code
    })
  }

  onSubmit = async () => {
    const { 
      title,
      questionCode,
      answerCode
    } = this.state
    if(title === '' && questionCode === '' && answerCode === '') {
      notification.warn({
        message: 'ใส่ชื่อด้วย โจทย์ด้วย คำตอบด้วยสิ!'
      })
      return
    }
    this.setState({
      loading: true
    })
    const creatingResult = await createNewQuestion(
      title,
      questionCode,
      answerCode
    )
    if(creatingResult) {
      notification.success({
        message: 'เพิ่มโจทย์ให้แล้วจร้า'
      })
      this.setState(initialState)
    } else {
      notification.success({
        message: 'มีบางอย่างผิดพลาด ลองดูใหม่นะ'
      })
      this.setState({
        loading: false,
      })
    }
  }

  render() {
    return (
      <AdminLayout>
        <Row
          style={{
            marginTop: 10
          }}
        >
          <Col span={2}>
            <h2>
            ชื่อโจทย์
            </h2>
          </Col>
          <Col span={22}>
            <Input
              value={this.state.title}
              onChange={this.onTitleChange}
              title="Question name"
            />
          </Col>
        </Row>
        <Row gutter={4}>
          <Col span={12}>
            <h2>Question Code (.js)</h2>
            <Editor 
              mode='javascript'
              name="ace-code-question"
              value={this.state.questionCode}
              onChange={this.onQuestionCodeEditorChange}
            />
          </Col>
          <Col span={12}>
            <h2>Answer (.txt)</h2>
            <Editor 
              mode="text"
              name="ace-code-answer"
              value={this.state.answerCode}
              onChange={this.onAnswerCodeEditorChange}
            />
          </Col>
        </Row>
        <Row type="flex" justify="end">
          <Button
            loading={this.state.loading}
            size="large"
            type="primary"
            icon="play-circle"
            style={{
              marginTop: 10
            }}
            onClick={this.onSubmit}
          >
            Add new question
          </Button>
        </Row>
      </AdminLayout>
    )
  }
}
