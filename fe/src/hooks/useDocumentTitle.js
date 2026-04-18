import { useEffect } from "react"

export default function useDocumentTitle(title) {

  useEffect(function () {
    if (!title) return

    document.title = `Movie | ${title}`;

    return function () {
      document.title = 'usePopcorn';
    };
  }, [title])
}