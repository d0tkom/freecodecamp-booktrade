import React from 'react'
import { Button, Form } from 'semantic-ui-react'

const ProfileForm = (props) => (
  <Form onSubmit={props.submit}>
    <Form.Field>
      <label>Full name</label>
      <input id="fullName" placeholder='Full name' value={props.user.fullName} onChange={props.change}/>
    </Form.Field>
    <Form.Field>
      <label>City</label>
      <input id="city" placeholder='City' value={props.user.city} onChange={props.change}/>
    </Form.Field>
    <Form.Field>
      <label>State</label>
      <input id="state" placeholder='State' value={props.user.state} onChange={props.change}/>
    </Form.Field>
    <Button type='submit'>Submit</Button>
  </Form>
)

export default ProfileForm