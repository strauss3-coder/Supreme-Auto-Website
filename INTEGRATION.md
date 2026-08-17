# Database integration

This website no longer stores its own content. Everything it displays comes from the Supabase project behind the Supreme Auto portal, so a change in the portal appears here on the next page load. There is no file to edit and no deploy needed to change stock, prices, photos, reviews or contact details.

## What is database driven now

| On the website | Comes from | Edit it in |
| --- | --- | --- |
| Inventory grid, filters, detail panel | `website_vehicles` view | Portal, Vehicle Management |
| Vehicle photos | `images` column, absolute URLs | Portal, vehicle Photos tab |
| Testimonial carousel | `testimonials` table | Portal, Testimonials |
| Enquiry form submissions | `enquiries` table | Portal, Enquiries |
| Phone, email, address, hours, socials | `site_settings.contact` | Portal, Contact Details |
| Hero heading, subtitle, buttons | `site_settings.homepage` | Portal, Homepage Editor |
| Vehicles Sold and Financing Partners counters | `site_settings.homepage.stats` | Portal, Homepage Editor |
| Vehicle of Interest dropdown on the form | same vehicle data | follows stock automatically |

Still hardcoded on purpose: the Google rating and review count in the testimonials section, because those are claims about Google that must match Google, not free text someone can type.

## The files

| File | Role |
| --- | --- |
| `js/supabase-data.js` | The only file that talks to Supabase. Config, field mapping, caching. |
| `js/vehicles-data.js` | `getVehicles()` now reads the database. Its four consumers were not changed. |
| `js/testimonials-render.js` | Builds the review cards from the database. |
| `js/testimonials.js` | The existing carousel, now re-runnable after a render. |
| `js/site-content.js` | Applies contact details, hours, socials, hero copy and stats. |
| `js/contact-form.js` | Saves the enquiry to the portal, then hands off to WhatsApp. |

## Field mapping

The portal stores `brand`, `fuel`, `body`, `engine`, `installment`, `stock`. This site was built around `make`, `fuelType`, `bodyType`, `engineSize`, `financePerMonth`, `stockNumber`. The translation lives in `toSiteVehicle()` in `js/supabase-data.js`, which is why `inventory.js`, `detail.js`, `finance-wizard.js` and the form's vehicle picker all still work untouched.

`power` is stored as text in the portal ("132 kW") and parsed back to a number here, because the site prints its own kW unit.

## How the markup is bound

Elements that receive content carry a `data-sa` attribute, for example `data-sa="phone"`. `site-content.js` only touches elements with that attribute, so restyling or rearranging the page cannot silently break a binding, and an element without the attribute is left alone.

If a value is missing from the database, the markup already in the page stays as it is. An empty field can never blank out the contact section.

## Vehicle status behaviour

- **Sold**: stays visible with a "Sold" tag. Good for social proof.
- **Reserved**: stays visible with a "Reserved" tag.
- **Archived**: disappears from the website entirely. Archive a vehicle in the portal to take it off the site without deleting the record.
- **Featured**: sorted to the top of the grid and tagged "Featured".

To stop showing sold vehicles, change the `website_vehicles` view to add `and sold = false`.

## Enquiries

The form does two things on submit, in this order:

1. Writes the enquiry to the database so it appears in the portal as unread.
2. Opens WhatsApp with the same details, exactly as before.

The WhatsApp handoff is deliberately not conditional on the database write. If Supabase is unreachable the customer still gets through, which is the point of the form. A failed write is logged to the console and never shown to the customer.

## When Supabase is unreachable

Every successful read is cached in the visitor's browser and used as a fallback.

- **Returning visitor**: sees the full site from cache.
- **First time visitor during an outage**: the inventory shows its normal empty state and the testimonials section hides itself, but the contact details and the enquiry form still work, because those fall back to the markup in `index.html`.

The cache is refreshed on every load and is never the source of truth.

## The security key in the source

`SUPABASE_KEY` in `js/supabase-data.js` is a publishable key. It is meant to be in public website code. The database's row level security is what protects the data: a visitor can read published stock, reviews and settings, and can insert one enquiry. They cannot read customer enquiries or change any record. Changing content additionally requires a signed in account on the `portal_owners` allowlist.

Never put a secret or `service_role` key in this repository.

## assets/vehicles.json

No longer read by anything. It was the source for the one time migration and is kept only as a record. Safe to delete once the database has been running for a while.

## Cache busting

Script tags use `?v=36`. Bump that number when you change a JS file, otherwise returning visitors keep the old one.
