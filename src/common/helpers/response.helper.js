export function responseSuccess(res, content, message = "Thành công") {
  return res.status(200).json({ statusCode: 200, message, content });
}
