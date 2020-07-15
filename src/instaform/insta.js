import React from 'react'
import Axios from 'axios'


class Instagram extends React.Component {
  state = {
    instagramTag: {
      __html: ''
    }
  }

  getInstagram = (props) => {
    Axios.get(
      `https://api.instagram.com/oembed`,
      {
        params: {
          url: props.decoratedText
        }
      }
    ).then((response) => {
      console.log(response)
      let html = response.data.html
      console.log(response.data.html.search(`<script async src="https://www.instagram.com/embed.js"></script>`))
      html = html.replace(
        `<script async src="//www.instagram.com/embed.js"></script>`,
        `<script async src="https://www.instagram.com/embed.js"></script>`)
      console.log(html)
      this.setState({instagramTag: {__html: html}}) 

      if(window.instgrm !== undefined) {
        window.instgrm.Embeds.process()
      }
    })
  }

  componentDidMount() {
    this.getInstagram(this.props.draftProps)

    const script = document.createElement("script");

    script.src = "https://www.instagram.com/embed.js";
    script.async = true;

    document.body.appendChild(script);
    // window.instgrm.Embeds.process()
  }
  
  render () {
    // window.instgrm.Embeds.process()
    const children = this.props.draftProps.children
    console.log(children)
    return (
      <div>
        <div style={{display: "none"}}>{children}</div>
        <div dangerouslySetInnerHTML={this.state.instagramTag}/>
      </div>
    )
  }
}

export default Instagram