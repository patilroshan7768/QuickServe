import { Link } from 'react-router-dom';
import ServiceImage from './ServiceImage';
import { formatPrice } from '../utils/format';

export default function ServiceCard({ service }) {
  return (
    <article className="card flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
      <ServiceImage src={service.imageUrl} alt={service.name} category={service.category} className="h-48 w-full" />
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          {service.category}
        </span>
        <h3 className="mt-3 text-lg font-bold text-slate-900">{service.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{service.description}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <p className="text-lg font-extrabold text-indigo-600">{formatPrice(service.price)}</p>
          <Link to={`/services/${service.id}`} className="btn-primary !px-4 !py-2">View Details</Link>
        </div>
      </div>
    </article>
  );
}
