import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Size Guide — ' + siteConfig.name,
  description: 'Measurements in inches for kurtis, suits, dresses and bottoms.',
};

const LAST_UPDATED = '18 August 2026';

export default function SizeGuidePage() {
  return (
    <main>
      <div className="section legal-page">
        <span className="section-kicker">Help</span>
        <h1 className="section-title" style={{ marginBottom: 8 }}>Size Guide</h1>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 32 }}>
          Last updated {LAST_UPDATED}
        </p>

        <p>
          All measurements are <strong>body measurements in inches</strong>, not garment
          measurements. Our kurtis and suits are cut with ease built in, so pick the size
          that matches your body and it will sit comfortably.
        </p>

        <h2>Kurtis, suits &amp; dresses</h2>
        <div className="table-scroll">
          <table className="size-table">
            <thead>
              <tr><th>Size</th><th>Bust</th><th>Waist</th><th>Hip</th></tr>
            </thead>
            <tbody>
              <tr><td>XS</td><td>32</td><td>26</td><td>35</td></tr>
              <tr><td>S</td><td>34</td><td>28</td><td>37</td></tr>
              <tr><td>M</td><td>36</td><td>30</td><td>39</td></tr>
              <tr><td>L</td><td>38</td><td>32</td><td>41</td></tr>
              <tr><td>XL</td><td>40</td><td>34</td><td>43</td></tr>
              <tr><td>XXL</td><td>42</td><td>36</td><td>45</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Bottoms &amp; palazzos</h2>
        <div className="table-scroll">
          <table className="size-table">
            <thead>
              <tr><th>Size</th><th>Waist</th><th>Hip</th><th>Length</th></tr>
            </thead>
            <tbody>
              <tr><td>XS</td><td>26</td><td>35</td><td>38</td></tr>
              <tr><td>S</td><td>28</td><td>37</td><td>38</td></tr>
              <tr><td>M</td><td>30</td><td>39</td><td>39</td></tr>
              <tr><td>L</td><td>32</td><td>41</td><td>39</td></tr>
              <tr><td>XL</td><td>34</td><td>43</td><td>40</td></tr>
              <tr><td>XXL</td><td>36</td><td>45</td><td>40</td></tr>
            </tbody>
          </table>
        </div>

        <h2>How to measure</h2>
        <ul>
          <li><strong>Bust</strong> &mdash; around the fullest part, tape level and not pulled tight.</li>
          <li><strong>Waist</strong> &mdash; around the narrowest part, usually just above the navel.</li>
          <li><strong>Hip</strong> &mdash; around the fullest part, roughly 8 inches below the waist.</li>
        </ul>

        <h2>Between two sizes?</h2>
        <p>
          Go with the larger one. Ethnic silhouettes drape better with a little room, and a
          loose kurti can be taken in far more easily than a tight one can be let out.
        </p>

        <h2>Unstitched suits</h2>
        <p>
          Unstitched sets come as fabric only. Standard pieces are 2.5m for the kurta,
          2.5m for the bottom and 2.25m for the dupatta, which is enough for sizes up to XXL.
        </p>

        <p style={{ marginTop: 28 }}>
          Still unsure? Send us your measurements at{' '}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> and we will tell
          you which size to order.
        </p>

      </div>
      <Footer />
    </main>
  );
}
