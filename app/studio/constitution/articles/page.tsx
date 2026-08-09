import { ArticleBlock, ConstitutionLayout } from "../_components/ConstitutionUI";
import { articles } from "../_components/constitution-data";

export const metadata = { title: "15 Design Articles | Design Constitution" };

export default function ArticlesPage() {
  return <ConstitutionLayout active="Articles" eyebrow="CONSTITUTION / 15 ARTICLES" title="Constitution Checklist" summary="15개 조항을 Rule, 이유, 실제 제품 문맥의 Good·Do not 예시와 Review Question으로 검토합니다." aside={<><strong>Checklist usage</strong><p>조항을 점수로 환산하지 않습니다. 관련 질문에 대한 Evidence와 예외 기록으로 판단합니다.</p><span className="constitution-status needs-review">Default · Needs Review</span></>}>
    <div className="article-list">{articles.map((article) => <ArticleBlock article={article} key={article.number} />)}</div>
  </ConstitutionLayout>;
}
