import { cookies } from "next/headers";

export type Locale = "ko" | "en";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const lang = store.get("lang")?.value;
  return lang === "en" ? "en" : "ko";
}

export function t(locale: Locale, ko: string, en: string): string {
  return locale === "en" ? en : ko;
}

const messages = {
  postDetailTitle: { ko: "게시글 상세", en: "Post Detail" },
  postNotFound: { ko: "게시글을 찾을 수 없습니다.", en: "Post not found." },
  backToList: { ko: "목록으로 돌아가기", en: "Back to List" },
  author: { ko: "작성자", en: "Author" },
  category: { ko: "카테고리", en: "Category" },
  date: { ko: "날짜", en: "Date" },
  openLink: { ko: "링크 열기", en: "Open Link" },
  openFile: { ko: "파일 열기", en: "Open File" },
  comments: { ko: "댓글", en: "Comments" },
  writeComment: { ko: "댓글을 입력해 주세요.", en: "Write a comment" },
  addComment: { ko: "댓글 작성", en: "Add Comment" },
  editComment: { ko: "댓글 수정", en: "Edit Comment" },
  deleteComment: { ko: "댓글 삭제", en: "Delete Comment" },
  noComments: { ko: "아직 댓글이 없습니다.", en: "No comments yet." },
  edit: { ko: "수정하기", en: "Edit" },
  delete: { ko: "삭제하기", en: "Delete" },
  editBlogPost: { ko: "블로그 글 수정", en: "Edit Blog Post" },
  writeBlogPost: { ko: "블로그 글 쓰기", en: "Write Blog Post" },
  writeGuestPost: { ko: "게스트 글 쓰기", en: "Write Guest Post" },
  title: { ko: "제목", en: "Title" },
  content: { ko: "내용", en: "Content" },
  linkUrlOptional: { ko: "링크 URL (선택)", en: "Link URL (optional)" },
  uploadFileOptional: { ko: "파일 업로드 (선택)", en: "File upload (optional)" },
  replaceFileOptional: { ko: "파일 교체 (선택)", en: "Replace file (optional)" },
  removeExistingAttachment: { ko: "기존 첨부파일 제거", en: "Remove existing attachment" },
  enterTitle: { ko: "제목을 입력해 주세요.", en: "Enter a title." },
  enterAuthorName: { ko: "작성자 이름", en: "Author name" },
  enterContent: { ko: "글 내용을 입력해 주세요.", en: "Enter post content." },
  publish: { ko: "게시하기", en: "Publish" },
  save: { ko: "저장하기", en: "Save" },
  cancel: { ko: "취소", en: "Cancel" },
  postDeleteFailed: { ko: "게시글 삭제에 실패했습니다.", en: "Failed to delete post." },
  guestPostDeleteFailed: { ko: "방명록 삭제에 실패했습니다.", en: "Failed to delete guest post." },
  commentDeleteFailed: { ko: "댓글 삭제에 실패했습니다.", en: "Failed to delete comment." },
  titleRequired: { ko: "제목을 입력해 주세요.", en: "Please enter a title." },
  contentRequired: { ko: "내용을 입력해 주세요.", en: "Please enter content." },
  authorContentRequired: { ko: "작성자와 내용을 입력해 주세요.", en: "Please enter author and content." },
  titleContentRequired: { ko: "제목과 내용을 입력해 주세요.", en: "Please enter title and content." },
  postSaveFailed: { ko: "게시글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.", en: "Failed to save post. Please try again later." },
  guestPostSaveFailed: { ko: "게스트 게시글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.", en: "Failed to save guest post. Please try again later." },
} as const;

export type I18nKey = keyof typeof messages;

export function tk(locale: Locale, key: I18nKey): string {
  return messages[key][locale];
}
