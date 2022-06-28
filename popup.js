document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("body")
  const mainList = document.getElementById("main-list")
  const addButton = document.getElementById("add")

  const PROMPT_MESSAGE = "Copy to clipboard: Ctrl+C, Enter"
  const HTML_CLASS_FOR_SAMPLES = "sample-text"

  const createSpanForText = (sample) => {
    let sampleTextSpan = document.createElement("span")
    sampleTextSpan.innerText = sample
    sampleTextSpan.classList.add(HTML_CLASS_FOR_SAMPLES)
    sampleTextSpan.addEventListener("click", () => window.prompt(PROMPT_MESSAGE, sample))
    return sampleTextSpan
  }

  const createRemoveListItemButton = () => {
    let removeListItemButton = document.createElement("span")
    removeListItemButton.style.fontWeight = "bold"
    removeListItemButton.style.color = "darkred"
    removeListItemButton.innerText = "x"
    removeListItemButton.addEventListener("click", () => {
      removeListItemButton.parentElement.remove()
      const currentListOfSamplesTags = document.getElementsByClassName(HTML_CLASS_FOR_SAMPLES)
      const currentListOfSamplesTexts = Array.prototype.slice.call(currentListOfSamplesTags).map((el) => el.innerHTML)
      chrome.storage.sync.set({"samples": currentListOfSamplesTexts}, () => {})
    })
    return removeListItemButton
  }

  const addSampleToTheList = (sample) => {
    let sampleTextSpan = createSpanForText(sample)
    let removeListItemButton = createRemoveListItemButton()
    let newItemInTheList = document.createElement("li")

    newItemInTheList.appendChild(removeListItemButton)
    newItemInTheList.appendChild(sampleTextSpan)
    mainList.appendChild(newItemInTheList)
  }

  const refreshList = () => {
    mainList.innerHTML = ""
    chrome.storage.sync.get("samples", (result) => {
      if (Array.isArray(result.samples)) {
        result.samples.forEach((sample) => addSampleToTheList(sample))
      }
    })
  }

  refreshList()

  addButton.addEventListener("click", () => {
    let textarea = document.createElement("textarea")
    let saveButton = document.createElement("button")
    saveButton.innerText = "Save"

    textarea.focus()

    body.appendChild(textarea)
    body.appendChild(saveButton)

    saveButton.addEventListener("click", () => {
      saveButton.classList.add("disabled")

      const newSample = textarea.value.replace(/\s+/g, " ").trim()

      if (newSample.length) {
        textarea.value = ""
        textarea.focus()

        chrome.storage.sync.get("samples", (result) => {
          if (Array.isArray(result.samples)) {
            const newCollectionWithoutDuplicates = [...new Set([...result.samples,...[newSample]])]
            chrome.storage.sync.set({"samples": newCollectionWithoutDuplicates}, () => {})
          } else {
            chrome.storage.sync.set({"samples": [newSample]})
          }
          refreshList()
        })
      }

      textarea.remove()
      saveButton.remove()
      saveButton.classList.remove("disabled")
    })
  })
})
