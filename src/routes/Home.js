import { dbService, storageService } from "fbase"
import { useEffect, useState } from "react"
import Nweet from "components/Nweets"
import { v4 as uuidv4 } from "uuid"

const Home = ({ userObj }) => {
  const [nweet, setNweet] = useState("")
  const [nweets, setNweets] = useState([])
  const [attachment, setAttachment] = useState("")
  
  useEffect(() => {
    dbService.collection("nweets").onSnapshot((snapshot) => {
      const newArray = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }))
      setNweets(newArray)
    })
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    let attachmentUrl = ""
    if(attachment !== "") {
      const attachmentRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`)
      const response = await attachmentRef.putString(attachment, "data_url")
      attachmentUrl = await response.ref.getDownloadURL()
    }
    await dbService.collection("nweets").add({
      text: nweet,
      createdAt: Date.now(),
      createdID: userObj.uid,
      attachmentUrl
    })
    setNweet("")
    setAttachment("")
  }

  const onChange = (e) => {
    e.preventDefault()
    const {
      target: { value }
    } = e
    setNweet(value)
  }

  const onFileChange = (e) => {
    const {
      target: {files},
    } = e
    const theFile = files[0]
    const reader = new FileReader
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: {result},
      } = finishedEvent
      setAttachment(result)
    }
    reader.readAsDataURL(theFile)
  }

  const onClearAttachment = () => setAttachment("")

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          value={nweet}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind"
          maxLength={120}
        />
        <input type="file" accept="image/*" onChange={onFileChange} /> 
        <input type="submit" value="Nweet" />
        {attachment && (
          <div>
            <img src={attachment} width="50px" height="50px" />
            <button onClick={onClearAttachment}>삭제</button>
          </div>
        )}
      </form>
      <div>
        {nweets.map((nweet) => (
          <Nweet 
            key={nweet.id} 
            nweetObj={nweet} 
            isOwner={nweet.createdID === userObj.uid}
          />
        ))}
      </div>
    </>
  )
}

export default Home