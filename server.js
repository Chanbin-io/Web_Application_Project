// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(".")); // index.html 있는 디렉터리

app.post("/api/ai-comment", async (req, res) => {
  const { payload } = req.body;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9, // ✅ 창의성 강화 (기존 0.7 이하 → 반복문장 감소)
        messages: [
          {
            role: "system",
            content:
              "너는 날씨에 어울리는 생활 코멘트를 작성하는 감성적인 AI야. " +
              "같은 날씨라도 매번 다르게 표현하고, 문체는 자연스럽고 따뜻해야 해. " +
              "음식, 옷차림, 활동은 가능한 한 구체적으로 제안해. " +
              "예를 들어, '따뜻한 국물' 대신 '유자차'나 '된장찌개'처럼 세부적으로 표현해. " +
              "계절감과 한국 지역 문화를 고려해 제안해줘.",
          },
          {
            role: "user",
            content:
              `다음 날씨 정보를 참고해서, 오늘의 기분을 담은 1) 한줄 코멘트, 2) 옷차림, 3) 활동, 4) 음식 추천을 한국어로 작성해줘. 
항목별로 완성된 문장 형태로 표현하고, 매번 조금씩 다르게 말투나 표현을 바꿔줘. 
결과는 JSON 형식으로 {"line","wear","act","food"} 만 포함해서 줘.
날씨정보: ${payload}`,
          },
        ],
      }),
    });

    const data = await r.json();

    // 응답 파싱
    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      "AI 응답을 받지 못했습니다.";

    res.json({ ok: true, text });
  } catch (e) {
    console.error("❌ OpenAI API 호출 실패:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ 서버 실행 중: http://localhost:${PORT}`));
