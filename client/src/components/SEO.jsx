import { Helmet } from 'react-helmet-async'

const DEFAULT_TITLE = '구의정원 - GUGARDEN'
const DEFAULT_DESCRIPTION = '구의정원 - 테라리움, 비바리움, 팔루다리움 전문 식물 인테리어 쇼핑몰. 자연을 담은 유리정원을 만나보세요.'

export default function SEO({ title, description }) {
  const fullTitle = title ? `${title} | 구의정원` : DEFAULT_TITLE
  const desc = description || DEFAULT_DESCRIPTION

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  )
}
