document.addEventListener("DOMContentLoaded", () => {
  const mainList = document.getElementById("main-list")
  const textarea =  document.getElementById("main-textarea")
  const saveButton = document.getElementById("save")
  const PROMPT_MESSAGE = "Copy to clipboard: Ctrl+C, Enter"

  const addSampleToTheList = (sample) => {
    let newItemInTheList = document.createElement("li")
    newItemInTheList.innerHTML = sample
    newItemInTheList.addEventListener("click", () =>  window.prompt(PROMPT_MESSAGE, sample))
    mainList.appendChild(newItemInTheList)
  }

  const refreshList = () => {
    mainList.innerHTML = ""
    chrome.storage.local.get("samples", (result) => {
      if(Array.isArray(result.samples)) {
        result.samples.forEach((sample) => addSampleToTheList(sample))
      }
    })
  }

  refreshList()

  saveButton.addEventListener("click", () => {
    const newSample = textarea.value.replace(/\s+/g, " ").trim()
    textarea.value = ""

    if(newSample.length) {
      chrome.storage.local.get("samples", (result) => {
        if(Array.isArray(result.samples)) {
          const newCollectionWithoutDuplicates = [...new Set([...result.samples,...[newSample]])]
          chrome.storage.local.set({"samples": newCollectionWithoutDuplicates}, () => {})
        } else {
          chrome.storage.local.set({"samples": [newSample]})
        }
        refreshList()
      })
    }
  })
})
