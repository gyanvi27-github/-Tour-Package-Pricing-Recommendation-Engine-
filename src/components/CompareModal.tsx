import React from 'react';
import { X, Star, Check, Globe, Sparkles } from 'lucide-react';
import { TourPackage } from '../types';
import { getPackageRatingStats } from '../data/ratingsData';
import { predictTourPrice } from '../lib/mlEngine';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: TourPackage[];
  onRemovePackage: (packageId: string) => void;
  onSelectPackage: (pkg: TourPackage) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  packages,
  onRemovePackage,
  onSelectPackage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Package Comparison Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating {packages.length} tour packages across real pricing, ratings, and characteristics
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {packages.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No packages selected for comparison yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Compare&quot; on any package card to compare up to 4 packages side-by-side.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-3 px-3 text-slate-400 font-medium uppercase tracking-wider w-40">
                    Feature
                  </th>
                  {packages.map((pkg) => {
                    const stats = getPackageRatingStats(pkg.package_id);
                    return (
                      <th key={pkg.package_id} className="py-3 px-3 min-w-[200px]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={pkg.imageUrl}
                              alt={pkg.destination}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-bold text-white text-sm">{pkg.destination}</div>
                              <div className="text-[10px] text-cyan-400">{pkg.package_id}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemovePackage(pkg.package_id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Category</td>
                  {packages.map((pkg) => (
                    <td key={pkg.package_id} className="py-3 px-3 text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium border border-slate-700">
                        {pkg.category}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Base Price</td>
                  {packages.map((pkg) => (
                    <td key={pkg.package_id} className="py-3 px-3 font-bold text-white text-sm">
                      ₹{pkg.base_price.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Demand Estimate (ML)</td>
                  {packages.map((pkg) => {
                    const pred = predictTourPrice({
                      package_id: pkg.package_id,
                      group_size: 2,
                      lead_time_days: 14,
                      travel_season: pkg.season_tag
                    });
                    return (
                      <td key={pkg.package_id} className="py-3 px-3">
                        <span className="font-bold text-cyan-400 text-sm">
                          ₹{pred.demandAdjustedEstimate.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({pred.differencePct > 0 ? `+${pred.differencePct}%` : `${pred.differencePct}%`})
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Duration</td>
                  {packages.map((pkg) => (
                    <td key={pkg.package_id} className="py-3 px-3 text-slate-200">
                      {pkg.duration_days} Days / {pkg.duration_days - 1} Nights
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Traveller Rating</td>
                  {packages.map((pkg) => {
                    const stats = getPackageRatingStats(pkg.package_id);
                    return (
                      <td key={pkg.package_id} className="py-3 px-3 text-amber-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {stats.averageRating}
                          <span className="text-slate-400 font-normal text-[10px]">
                            ({stats.totalRatings})
                          </span>
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Destination Popularity</td>
                  {packages.map((pkg) => (
                    <td key={pkg.package_id} className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{pkg.destination_popularity}%</span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${pkg.destination_popularity}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Recommended Group Size</td>
                  {packages.map((pkg) => (
                    <td key={pkg.package_id} className="py-3 px-3 text-slate-300">
                      For {pkg.group_size_range} travelers
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Optimal Season</td>
                  {packages.map((pkg) => (
                    <td key={pkg.package_id} className="py-3 px-3 text-slate-300">
                      {pkg.season_tag}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Territory</td>
                  {packages.map((pkg) => (
                    <td key={pkg.package_id} className="py-3 px-3 text-slate-300">
                      {pkg.is_international ? (
                        <span className="flex items-center gap-1 text-amber-300 font-medium">
                          <Globe className="w-3.5 h-3.5" /> International
                        </span>
                      ) : (
                        <span className="text-blue-300 font-medium">Domestic</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Action</td>
                  {packages.map((pkg) => (
                    <td key={pkg.package_id} className="py-3 px-3">
                      <button
                        onClick={() => {
                          onSelectPackage(pkg);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
};
