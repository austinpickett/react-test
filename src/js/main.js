import $ from 'jquery'
import marked from 'marked'

import React from 'react'
import { render } from 'react-dom'

class CommentBox extends React.Component {
	constructor(props) {
		super(props)

		this.state = { data: [] }
	}

	componentDidMount() {
		this.loadCommentsFromServer()
	}

	loadCommentsFromServer() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,

			success: function(data) {
				console.info('xhr:', data)
				this.setState({ data: data })
			}.bind(this)
		})
	}
	handleCommentSubmit(comment) {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: comment,

			success: function(data) {
				this.setState({data: data})
			}.bind(this)
		})
	}
	render() {
		if (this.state.data.length === 0)
			return <p>Loading&hellip;</p>

		return (
			<div className="commentBox">
				<h1>Comments</h1>
				<CommentList data={this.state.data} />
				<CommentForm onCommentSubmit={this.handleCommentSubmit.bind(this)} />
			</div>
		)
	}
}

class CommentList extends React.Component {
	render() {
		return (
		<div className="commentList">
		{this.props.data.map(function(comment) {
			return <Comment 
				key={Math.random()} 
				author={comment.author}>{comment.text}</Comment>
		})}
		</div>
		)
	}
}

class Comment extends React.Component {
	rawMarkup() {
		var rawMarkup = marked(this.props.children.toString(), {sanitize: true})
		return {__html: rawMarkup}
	}

	render() {
		return (
		<div className="comment">
			<h2 className="commentAuthor" dangerouslySetInnerHTML={{__html: this.props.author}} />
			<span dangerouslySetInnerHTML={this.rawMarkup()} />
		</div>
		)
	}
}

class CommentForm extends React.Component {
	constructor(props) {
		super(props)
		this.state = { author: '', text: '' }
	}
	handleAuthorChange(e) {
		this.setState({author: e.target.value})
	}
	handleTextChange(e) {
		this.setState({text: e.target.value})
	}
	handleSubmit(e) {
		e.preventDefault();
		var author = this.state.author.trim()
		var text = this.state.text.trim()

		if (!text || !author)
			return

		this.props.onCommentSubmit({author: author, text: text})
		this.setState({ author: '', text: '' })
	}

	render() {
		return (
		<form className="commentForm">
			<input
				type="text" placeholder="Name" 
				value={this.state.author}
				onChange={this.handleAuthorChange.bind(this)} />
			<input 
				type="text" placeholder="Comment"
				value={this.state.text}
				onChange={this.handleTextChange.bind(this)} />
			<input type="submit" value="Post" />
		</form>
		)
	}
}

render(
	<CommentBox url="api/comments.json" pollInterval={2000} />,
	document.getElementById('content')
)