import React from 'react'
import { Button, Form } from 'semantic-ui-react'

const BookForm = (props) => (
  <Form onSubmit={props.submit}>
    <Form.Field>
      <label>Title</label>
      <input placeholder='Title' value={props.title} onChange={props.change}/>
    </Form.Field>
    <Button type='submit'>Submit</Button>
  </Form>
)

export default BookForm