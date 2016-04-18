import $ from 'jquery'
import marked from 'marked'
import _ from 'lodash'

import React from 'react'
import { render } from 'react-dom'

class CommentBox extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			data: this.loadCommentsFromServer()
		}
	}

	loadCommentsFromServer() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				console.log(data)
				this.setState({data: data})
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString())
			}.bind(this)
		})
	}

	componenetDidMount() {
		this.loadCommentsFromServer()
		setInterval(this.loadCommentsFromServer(), this.props.pollInterval)
	}

	render() {
		return (
			<div className="commentBox">
				<h1>Comments</h1>
				<CommentList data={this.state.data} />
				<CommentForm />
			</div>
		)
	}
}

class CommentList extends React.Component {
	render() {
		var commentNodes = this.state.data.map(function(comment) {
			return (
				<Comment author={comment.author} key={comment.id}>
					{comment.text}
				</Comment>
			)
		})

		return (
			<div className="commentList">
				{commentNodes}
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
				<h2 className="commentAuthor">
					{this.props.author}
				</h2>
				<span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>
		)
	}
}

class CommentForm extends React.Component {
	render() {
		return (
			<div className="commentForm">
				Hello, world I'm a comment form.
			</div>
		)
	}
}
render(
	<CommentBox url="api/comments.json" pollInterval={2000} />,
	document.getElementById('content')
)