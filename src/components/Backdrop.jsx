import StarField from './StarField'

// Общий фон страницы: мягкое переливающееся сияние (aurora) и звёздное поле с созвездиями поверх
export default function Backdrop() {
  return (
    <>
      <div className="aurora" aria-hidden="true">
        <i className="aurora__a" />
        <i className="aurora__b" />
        <i className="aurora__c" />
      </div>
      <StarField />
    </>
  )
}
