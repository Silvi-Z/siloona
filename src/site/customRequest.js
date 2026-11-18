// A request for a design made for the customer — the home page's
// «Անհատական դիզայն». It is stored as an ordinary order with this design
// id and no price: Siloona agrees the price with the customer and sets it
// in the admin («Գին»), and the customer then pays from their order link.
//
// Plain data with no imports: the request form, the admin and the payment
// server (api/_lib/orders.js) all read it.

export const CUSTOM_DESIGN_ID = 'custom'
export const CUSTOM_DESIGN_LABEL = 'Անհատական դիզայն'

export const CUSTOM_EVENT_TYPES = {
  wedding: 'Հարսանիք',
  engagement: 'Նշանադրություն',
  birthday: 'Ծննդյան օր',
  baptism: 'Կնունք',
  gender_reveal: 'Սեռի բացահայտում',
  corporate: 'Կորպորատիվ',
  other: 'Այլ',
}

export const CUSTOM_KINDS = {
  new: 'Ամբողջովին նոր դիզայն',
  adapt: 'Հարմարեցնել ձեր դիզայններից մեկը',
}
