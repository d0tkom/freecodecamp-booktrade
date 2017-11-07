import React from 'react'
import { List, Button, Header, Popup, Grid, Icon } from 'semantic-ui-react'

const BookList = (props) => (
  <List divided relaxed>
      {props.books.map((item, i) => {
        return <List.Item>
            {(props.myBooks && props.myBooks.length > 0 && item.userId != props.user.google.id) ?
                <List.Content floated='right'>
                    <Popup
                        trigger={<Button>Trade for</Button>}
                        flowing
                        hoverable
                    >
                        <List>
                            {props.myBooks.map((myItem, i) => {
                            return <List.Item onClick={() => {props.trade(item._id, myItem._id)}}>
                                <List.Content>
                                        <List.Header as='a'>{myItem.title}</List.Header>
                                </List.Content>
                            </List.Item>
                            })}
                        </List>
                    </Popup>
                </List.Content> :
                ""
            }
            <List.Icon name='book' size='large' verticalAlign='middle' />
            <List.Content>
                <List.Header as='a'>{item.title}</List.Header>
                {(!props.myBooks) ?
                    <List.Description>
                        <span>Trades proposed: </span>
                        {item.trades.map((tradeItem, i) => {
                            if (tradeItem[0].proposerId != props.user.google.id) {
                                return <span>{tradeItem[0].title} <Icon onClick={() => {props.trade('put', item._id, tradeItem[0].bookId)}} link bordered name='checkmark'/><Icon onClick={() => {props.trade('delete', item._id, tradeItem[0].bookId)}} link bordered name='remove'/> </span>;                                
                            }
                            else {
                                return <span>{tradeItem[0].title} | </span>;                                                                
                            }
                        })}
                    </List.Description> :
                    <List.Description as='a'>Added by: {item.userId}</List.Description>
                }
            </List.Content>
        </List.Item>
      })}
  </List>
)

export default BookList